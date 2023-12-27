import { LocalCacheDataStorage } from '../lib/local-cache-data.storage';
import { LocalCacheManager } from '../lib/local-cache.manager';
import { LocalTimeStampProvider } from '../lib/local-time-stamp.provider';
import { CacheStateConfig } from '../interface/cache-state-config.interface';
import { CacheKey } from '../interface/cache-key.interface';

export function CacheState(config?: CacheStateConfig) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalFunction = descriptor.value;

    if (typeof originalFunction !== 'function') {
      throw new Error('Use @CacheState() decorator on functions!');
    }

    const maxAgeInMs = config?.maxAgeMS ?? 60000;

    const cacheDataStorage = config?.cacheDataStorage ?? new LocalCacheDataStorage();
    const dateProvider = config?.timeStampProvider ?? new LocalTimeStampProvider();
    const cacheManager = new LocalCacheManager(cacheDataStorage, originalFunction, maxAgeInMs, dateProvider);

    if (config?.updatedObservable) {
      config.updatedObservable
        .subscribe(async (cacheKey: CacheKey | void) => {
          await cacheManager.invalidateAndUpdateAsync(cacheKey || undefined);
        });
    }

    descriptor.value = function(args: any[]) {
      const cacheKey = _generateCacheKey(config, target, propertyKey, descriptor, args);

      return cacheManager.getCache$(cacheKey, args);
    };
  };

  function _generateCacheKey(
    config: CacheStateConfig | undefined,
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
    args: any[],
  ): string {
    if (config?.cacheKey?.generator) {
      return config.cacheKey.generator(args, target, propertyKey, descriptor);
    }

    const prefix = config?.cacheKey?.prefixGenerator?.(args, target, propertyKey, descriptor) ?? (target.constructor.name + '#' + propertyKey);
    const suffix = config?.cacheKey?.suffixGenerator?.(args, target, propertyKey, descriptor) ?? (args.length ? JSON.stringify(args) : '');

    return `${ prefix }_${ suffix }`;
  }
}