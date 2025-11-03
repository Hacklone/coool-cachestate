import { UpdatedNotifier, UpdatedNotifierCacheKeyGenerator, UpdatedNotifierKey } from './update-notifier.interface';
import { RequireAtLeastOne } from 'type-fest';

/**
 * Represents the configuration for the CacheStateUpdater.
 */
export type CacheStateUpdaterConfig = RequireAtLeastOne<{
  /**
   * @description generates the cache key for the updated notifier
   * @default undefined
   */
  cacheKeyGenerator?: UpdatedNotifierCacheKeyGenerator;

  /**
   * @description When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  updatedNotifier?: UpdatedNotifier;


  /**
   * @description When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  updatedNotifierKey?: UpdatedNotifierKey;

}, 'updatedNotifier' | 'updatedNotifierKey'>;