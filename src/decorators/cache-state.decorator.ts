import { LocalCacheDataStorage } from '../lib/local-cache-data.storage';
import { LocalCacheManager } from '../lib/local-cache.manager';
import { LocalTimeStampProvider } from '../lib/local-time-stamp.provider';
import { CacheStateConfig } from '../interface/cache-state-config.interface';
import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GlobalCacheStateConfig } from '../lib/global-config';

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

    if (config?.updatedObservable) {
      config.updatedObservable
        .pipe(takeUntil(destroyed))
        .subscribe(async (cacheKey: CacheKey | void) => {
          await cacheManager.invalidateAndUpdateAsync(cacheKey || undefined);
        });
    }

    if (config?.invalidatedObservable) {
      config.invalidatedObservable
        .pipe(takeUntil(destroyed))
        .subscribe(async (cacheKey: CacheKey | void) => {
          await cacheManager.invalidateAsync(cacheKey);
        });
    }

    descriptor.value = function(...args: CallArgs) {
      const cacheKey = _generateCacheKey(config, target, propertyKey, descriptor, args);

      return cacheManager.getCache$(cacheKey, args, this);
    };
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