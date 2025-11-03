import { CacheStateUpdaterConfig } from '../interface/cache-state-updater-config.interface';
import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { isObservable, Observable, tap } from 'rxjs';
import { GlobalNotifierManager } from '../lib/global-notifier.manager';

/**
 * A decorator function that wraps a method to update a cache state when the method is called.
 * It supports methods returning Observables, Promises, or synchronous results.
 *
 * @param config Configuration object for CacheStateUpdater, which includes the cacheKeyGenerator
 *               for generating cache keys, updatedNotifier for emitting updates, or updatedNotifierKey
 *               for global notifier key reference.
 * @return A function that modifies the method's behavior to notify cache updates based on the specified configuration.
 */
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
              notifyUpdated(cacheKey);
            }),
          );
      } else if (result instanceof Promise) {
        return result.finally(() => {
          notifyUpdated(cacheKey);
        });
      } else {
        notifyUpdated(cacheKey);
      }

      return result;

      function notifyUpdated(cacheKey: CacheKey | undefined) {
        if (config.updatedNotifier) {
          config.updatedNotifier.next(cacheKey);
        } else if (config.updatedNotifierKey) {
          GlobalNotifierManager.notify(config.updatedNotifierKey, cacheKey);
        } else {
          throw new Error('Missing updatedNotifier');
        }
      }
    };
  };
}