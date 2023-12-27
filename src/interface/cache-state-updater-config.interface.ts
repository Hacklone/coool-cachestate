import { UpdatedNotifier, UpdatedNotifierCacheKeyGenerator } from './update-notifier.interface';

export interface CacheStateUpdaterConfig {
  /**
   * @description When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  updatedNotifier: UpdatedNotifier;

  /**
   * @description generates the cache key for the updated notifier
   * @default undefined
   */
  cacheKeyGenerator?: UpdatedNotifierCacheKeyGenerator;
}