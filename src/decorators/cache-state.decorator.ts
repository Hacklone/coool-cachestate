import { LocalCacheDataStorage } from '../lib/local-cache-data.storage';
import { LocalCacheManager } from '../lib/local-cache.manager';
import { LocalTimeStampProvider } from '../lib/local-time-stamp.provider';
import { CacheStateConfig } from '../interface/cache-state-config.interface';
import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { merge, Observable, Subject, takeUntil } from 'rxjs';
import { GlobalCacheStateConfig } from '../lib/global-config';
import { invalidateAllCacheSubject, invalidateAndUpdateAllCacheSubject } from '../lib/global-functions';

export function CacheState(config?: CacheStateConfig) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: CallArgs) => Observable<any>>,
  ): void {
    const originalFunction = descriptor.value;

    if (typeof originalFunction !== 'function') {
      throw new Error('Use @CacheState() decorator on functions!');
    }

    const destroyed = new Subject<void>();

    const maxAgeInMs = config?.maxAgeMS ?? GlobalCacheStateConfig?.maxAgeMS ?? 60000;

    const timestampProvider = config?.timestampProvider ?? GlobalCacheStateConfig?.timestampProvider ?? new LocalTimeStampProvider();
    const cacheDataStorage = config?.cacheDataStorage ?? GlobalCacheStateConfig?.cacheDataStorage ?? new LocalCacheDataStorage(timestampProvider);
    const cacheManager = new LocalCacheManager(cacheDataStorage, originalFunction, maxAgeInMs, timestampProvider);

    _subscribeToInvalidate();
    _subscribeToInvalidateAndUpdate();

    descriptor.value = function(...args: CallArgs) {
      const cacheKey = _generateCacheKey(config, target, propertyKey, descriptor, args);

      return cacheManager.getCache$(cacheKey, args, this);
    };

    function _subscribeToInvalidate() {
      const updateObservables: Observable<CacheKey | void>[] = [
        invalidateAllCacheSubject,
      ];

      if (config?.invalidatedObservable) {
        updateObservables.push(config.invalidatedObservable);
      }

      merge(...updateObservables)
        .pipe(takeUntil(destroyed))
        .subscribe(async (cacheKey: CacheKey | void) => {
          await cacheManager.invalidateAsync(cacheKey);
        });
    }

    function _subscribeToInvalidateAndUpdate() {
      const updateObservables: Observable<CacheKey | void>[] = [
        invalidateAndUpdateAllCacheSubject,
      ];

      if (config?.updatedObservable) {
        updateObservables.push(config.updatedObservable);
      }

      merge(...updateObservables)
        .pipe(takeUntil(destroyed))
        .subscribe(async (cacheKey: CacheKey | void) => {
          await cacheManager.invalidateAndUpdateAsync(cacheKey || undefined);
        });
    }
  };

  function _generateCacheKey(
    config: CacheStateConfig | undefined,
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
    args: CallArgs,
  ): string {
    if (config?.cacheKey?.generator) {
      return config.cacheKey.generator(args, target, propertyKey, descriptor);
    }

    const prefix = config?.cacheKey?.prefixGenerator?.(args, target, propertyKey, descriptor) ?? (target.constructor.name + '#' + propertyKey);
    const suffix = config?.cacheKey?.suffixGenerator?.(args, target, propertyKey, descriptor) ?? (args.length ? JSON.stringify(args) : '');

    return `${ prefix }_${ suffix }`;
  }
}