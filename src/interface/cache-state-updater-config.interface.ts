import { UpdatedNotifier, UpdatedNotifierCacheKeyGenerator, UpdatedNotifierKey } from './update-notifier.interface';

export type CacheStateUpdaterConfig = {
  /**
   * @description generates the cache key for the updated notifier
   * @default undefined
   */
  cacheKeyGenerator?: UpdatedNotifierCacheKeyGenerator;
} & (
  {
    /**
     * @description When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache.
     * @default undefined
     */
    updatedNotifier: UpdatedNotifier;
    updatedNotifierKey: never;
  }
  |
  {
    /**
     * @description When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache.
     * @default undefined
     */
    updatedNotifierKey: UpdatedNotifierKey;
    updatedNotifier: never;
  }
  );