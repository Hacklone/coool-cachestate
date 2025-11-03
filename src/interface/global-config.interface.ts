import { CacheDataStorage } from './cache-storage.interface';
import { TimestampProvider } from './timestamp.interface';

/**
 * Represents the configuration options for global caching behavior.
 */
export interface GlobalConfig {
  /**
   * @description a storage where the cache data is stored
   * @default store cached values locally
   */
  cacheDataStorage?: CacheDataStorage;

  /**
   * @description provides current timestamp, useful for testing
   */
  timestampProvider?: TimestampProvider;

  /**
   * @description max age of cache in milliseconds
   * @default 60000 (1 minute)
   */
  maxAgeMS?: number;
}