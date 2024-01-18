import { MemoryCacheDataStorage } from '../lib/memory-cache-data.storage';
import { LocalCacheManager } from '../lib/local-cache.manager';
import { LocalTimeStampProvider } from '../lib/local-time-stamp.provider';
import { CacheStateConfig } from '../interface/cache-state-config.interface';
import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { filter, merge, Observable, Subject, takeUntil } from 'rxjs';
import { GlobalCacheStateConfig } from '../lib/global-config';
import { invalidateAllCacheSubject, invalidateAndUpdateAllCacheSubject } from '../lib/global-functions';
import { GlobalNotifierManager } from '../lib/global-notifier.manager';

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
    const cacheDataStorage = config?.cacheDataStorage ?? GlobalCacheStateConfig?.cacheDataStorage ?? new MemoryCacheDataStorage(timestampProvider);
    const cacheManager = new LocalCacheManager(cacheDataStorage, originalFunction, maxAgeInMs, timestampProvider);

    _subscribeToInvalidate();
    _subscribeToInvalidateAndUpdate();

    descriptor.value = function(...args: CallArgs) {
      const cacheKey = _generateCacheKey(config, target, propertyKey, descriptor, args);

      return cacheManager.getCache$(cacheKey, args, this);
    };

    function _subscribeToInvalidate() {
      const invalidatedObservables: Observable<CacheKey | void>[] = [
        invalidateAllCacheSubject,
      ];

      if (config?.invalidatedObservable) {
        invalidatedObservables.push(config.invalidatedObservable);
      }

      if (config?.invalidatedObservableKey) {
        invalidatedObservables.push(GlobalNotifierManager.getNotifierObservable(config.invalidatedObservableKey));
      }

      let mergedInvalidatedObservables = merge(...invalidatedObservables)
        .pipe(takeUntil(destroyed));

      if (config?.invalidateOnlySpecific) {
        mergedInvalidatedObservables = mergedInvalidatedObservables
          .pipe(filter(_ => !!_));
      }

      mergedInvalidatedObservables.subscribe(async (cacheKey: CacheKey | void) => {
        await cacheManager.invalidateAsync(cacheKey);
      });
    }

    function _subscribeToInvalidateAndUpdate() {
      const updatedObservables: Observable<CacheKey | void>[] = [
        invalidateAndUpdateAllCacheSubject,
      ];

      if (config?.updatedObservable) {
        updatedObservables.push(config.updatedObservable);
      }

      if (config?.updatedObservableKey) {
        updatedObservables.push(GlobalNotifierManager.getNotifierObservable(config.updatedObservableKey));
      }

      let mergedUpdatedObservables = merge(...updatedObservables)
        .pipe(takeUntil(destroyed));

      if (config?.updateOnlySpecific) {
        mergedUpdatedObservables = mergedUpdatedObservables.pipe(
          filter(_ => !!_),
        );
      }

      mergedUpdatedObservables.subscribe(async (cacheKey: CacheKey | void) => {
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