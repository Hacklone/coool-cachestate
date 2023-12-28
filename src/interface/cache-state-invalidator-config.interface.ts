import { InvalidatedNotifier, InvalidatedNotifierCacheKeyGenerator } from './invalidate-notifier.interface';

export interface CacheStateInvalidatorConfig {
  /**
   * @description When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  invalidatedNotifier: InvalidatedNotifier;

  /**
   * @description generates the cache key for the updated notifier
   * @default undefined
   */
  cacheKeyGenerator?: InvalidatedNotifierCacheKeyGenerator;
}