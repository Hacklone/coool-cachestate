import { CacheKeyGenerator, CacheKeyPrefixGenerator, CacheKeySuffixGenerator } from './cache-key.interface';
import { CacheDataStorage } from './cache-storage.interface';
import { UpdatedNotifierKey, UpdatedObservable } from './update-notifier.interface';
import { TimestampProvider } from './timestamp.interface';
import { InvalidatedNotifierKey, InvalidatedObservable } from './invalidate-notifier.interface';

export interface CacheStateConfig {
  cacheKey?: {
    /**
     * @description generates the cache key
     * @default combination of cache key prefix and suffix (combination of class, method name and a hash of the function's arguments)
     */
    generator?: CacheKeyGenerator;

    /**
     * @description prefix for the cache key
     * @default combination of class and method name
     */
    prefixGenerator?: CacheKeyPrefixGenerator;

    /**
     * @description suffix for the cache key
     * @default a hash of the function's arguments
     */
    suffixGenerator?: CacheKeySuffixGenerator;
  };

  /**
   * @description a storage where the cache data is stored
   * @default store cached values locally
   */
  cacheDataStorage?: CacheDataStorage;

  /**
   * @description max age of cache in milliseconds
   * @default 60000 (1 minute)
   */
  maxAgeMS?: number;

  /**
   * @description When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  updatedObservable?: UpdatedObservable;

  /**
   * @description When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  updatedObservableKey?: UpdatedNotifierKey;

  /**
   * @description When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  invalidatedObservable?: InvalidatedObservable;

  /**
   * @description When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  invalidatedObservableKey?: InvalidatedNotifierKey;

  /**
   * @description provides current timestamp, useful for testing
   */
  timestampProvider?: TimestampProvider;
}