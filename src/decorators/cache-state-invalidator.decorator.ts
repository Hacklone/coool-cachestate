import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { CacheStateInvalidatorConfig } from '../interface/cache-state-invalidator-config.interface';
import { isObservable, Observable, tap } from 'rxjs';

export function CacheStateInvalidator(config: CacheStateInvalidatorConfig) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalFunction = descriptor.value;

    if (typeof originalFunction !== 'function') {
      throw new Error('Use @CacheStateInvalidator() decorator on functions!');
    }

    descriptor.value = function(...args: CallArgs) {
      const cacheKey: CacheKey | undefined = config.cacheKeyGenerator?.(args, target, propertyKey, descriptor);

      const result = originalFunction.apply(this, args);

      if (isObservable(result)) {
        return (result as Observable<any>)
          .pipe(
            tap(() => {
              config.invalidatedNotifier.next(cacheKey);
            }),
          );
      } else if (result instanceof Promise) {
        return result.finally(() => {
          config.invalidatedNotifier.next(cacheKey);
        });
      } else {
        config.invalidatedNotifier.next(cacheKey);
      }

      return result;
    };
  };
}