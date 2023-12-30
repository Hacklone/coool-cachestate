import { CacheStateUpdaterConfig } from '../interface/cache-state-updater-config.interface';
import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { isObservable, Observable, tap } from 'rxjs';

export function CacheStateUpdater(config: CacheStateUpdaterConfig) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalFunction = descriptor.value;

    if (typeof originalFunction !== 'function') {
      throw new Error('Use @CacheStateUpdater() decorator on functions!');
    }

    descriptor.value = function(...args: CallArgs) {
      const cacheKey: CacheKey | undefined = config.cacheKeyGenerator?.(args, target, propertyKey, descriptor);

      const result = originalFunction.apply(this, args);

      if (isObservable(result)) {
        return (result as Observable<any>)
          .pipe(
            tap(() => {
              config.updatedNotifier.next(cacheKey);
            }),
          );
      } else if (result instanceof Promise) {
        return result.finally(() => {
          config.updatedNotifier.next(cacheKey);
        });
      } else {
        config.updatedNotifier.next(cacheKey);
      }

      return result;
    };
  };
}