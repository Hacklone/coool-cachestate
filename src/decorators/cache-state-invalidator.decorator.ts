import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { CacheStateInvalidatorConfig } from '../interface/cache-state-invalidator-config.interface';
import { isObservable, Observable, tap } from 'rxjs';
import { GlobalNotifierManager } from '../lib/global-notifier.manager';

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
              notifyInvalidated(cacheKey);
            }),
          );
      } else if (result instanceof Promise) {
        return result.finally(() => {
          notifyInvalidated(cacheKey);
        });
      } else {
        notifyInvalidated(cacheKey);
      }

      return result;
    };

    function notifyInvalidated(cacheKey: CacheKey | undefined) {
      if (config.invalidatedNotifier) {
        config.invalidatedNotifier.next(cacheKey);
      } else if (config.invalidatedNotifierKey) {
        GlobalNotifierManager.notify(config.invalidatedNotifierKey, cacheKey);
      } else {
        throw new Error('Missing invalidatedNotifier');
      }
    }
  };
}