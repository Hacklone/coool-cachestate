import { CacheKey } from './cache-key.interface';
import { Timestamp } from './timestamp.interface';

/**
 * Represents cached data with associated metadata.
 *
 * @interface CacheData
 *
 * @property {any} data - The actual data stored in the cache.
 * @property {number} maxAgeMS - The maximum age of the cached data in milliseconds after which it is considered expired.
 * @property {Timestamp} createdAt - The timestamp representing the creation time of the cached data.
 */
export interface CacheData {
  /**
   * A variable to store any kind of data. The type of information this variable holds is unrestricted.
   * The `readonly` keyword ensures that the value of this variable cannot be reassigned after its initial initialization.
   */
  readonly data: any;

  /**
   * Specifies the maximum age in milliseconds.
   * This value determines the duration after which an associated resource
   * is considered expired or invalid.
   *
   * The exact use of this variable depends on the context in which it is implemented,
   * such as caching or timeout-related functionalities.
   */
  readonly maxAgeMS: number;

  /**
   * Represents the timestamp when the entity was created.
   * This is a read-only property and cannot be modified after initialization.
   * It typically stores a value in the form of a `Timestamp` object.
   */
  readonly createdAt: Timestamp;
}

/**
 * Determines whether the given cache is outdated based on the current timestamp.
 *
 * @param {CacheData} cache - The cache data object containing creation time and max age in milliseconds.
 * @param {Timestamp} now - The current timestamp used to compare with the cache expiration.
 * @return {boolean} Returns true if the cache is outdated, otherwise false.
 */
export function isCacheOutdated(cache: CacheData, now: Timestamp): boolean {
  return (cache.createdAt + cache.maxAgeMS) < now;
}

/**
 * Represents a storage mechanism for caching data.
 */
export interface CacheDataStorage {
  /**
   * Asynchronously stores the provided data in the cache for the given key.
   *
   * @param {CacheKey} key - The unique key representing the cached data.
   * @param {CacheData} data - The data to be stored in the cache.
   * @return {Promise<void>} A promise that resolves when the data has been successfully stored in the cache.
   */
  storeAsync(key: CacheKey, data: CacheData): Promise<void>;

  /**
   * Asynchronously retrieves the value associated with the provided key from the cache.
   *
   * @param {CacheKey} key - The key used to identify the cached data.
   * @return {Promise<CacheData | undefined>} A promise that resolves to the cached data if found, otherwise resolves to undefined.
   */
  getAsync(key: CacheKey): Promise<CacheData | undefined>;

  /**
   * Removes the specified keys from the cache asynchronously.
   *
   * @param {CacheKey[]} keys - An array of cache keys to be removed.
   * @return {Promise<void>} A promise that resolves when the keys are successfully removed.
   */
  removeAsync(keys: CacheKey[]): Promise<void>;
}