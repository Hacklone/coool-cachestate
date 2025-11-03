import { Observable } from 'rxjs';
import { CacheKey, CallArgs, CallContext } from './cache-key.interface';

/**
 * Interface representing a cache management system that handles caching and invalidation of data.
 *
 * @template T The type of the cached data.
 */
export interface CacheManager<T = any> {
  /**
   * Retrieves a cached value based on the provided key and arguments.
   *
   * @param {CacheKey} key - The unique identifier for the cache entry.
   * @param {CallArgs} args - The arguments associated with the cache retrieval.
   * @param {CallContext} context - The contextual information for the cache operation.
   * @return {Observable<T>} An observable that emits the cached value.
   */
  getCache$(key: CacheKey, args: CallArgs, context: CallContext): Observable<T>;

  /**
   * Invalidates the current cache and triggers an asynchronous update using the provided cache key.
   *
   * @param {CacheKey | void} cacheKey - The key identifying the cache to be invalidated,
   * or undefined to invalidate the global cache.
   * @return {Promise<void>} A promise that resolves when the cache invalidation
   * and update process is completed.
   */
  invalidateAndUpdateAsync(cacheKey: CacheKey | void): Promise<void>;
}