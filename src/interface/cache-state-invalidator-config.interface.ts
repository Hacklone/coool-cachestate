import {
  InvalidatedNotifier,
  InvalidatedNotifierCacheKeyGenerator,
  InvalidatedNotifierKey,
} from './invalidate-notifier.interface';
import { RequireAtLeastOne } from 'type-fest';

/**
 * @typedef {RequireAtLeastOne} CacheStateInvalidatorConfig
 *
 * Configuration for defining the invalidation behavior of cache states.
 * This type ensures that at least one of `invalidatedNotifier` or `invalidatedNotifierKey` is provided.
 *
 * @property {InvalidatedNotifierCacheKeyGenerator} [cacheKeyGenerator]
 * Generates the cache key for the updated notifier.
 *
 * @property {InvalidatedNotifier} [invalidatedNotifier]
 * Emits when the cache is invalidated. If a `CacheKey` is provided, only that specific cache is invalidated; otherwise, all related caches are invalidated.
 *
 * @property {InvalidatedNotifierKey} [invalidatedNotifierKey]
 * Emits when the cache is invalidated. If a `CacheKey` is provided, only that specific cache is invalidated; otherwise, all related caches are invalidated.
 */
export type CacheStateInvalidatorConfig = RequireAtLeastOne<{
  /**
   * @description generates the cache key for the updated notifier
   * @default undefined
   */
  cacheKeyGenerator?: InvalidatedNotifierCacheKeyGenerator;

  /**
   * @description When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  invalidatedNotifier?: InvalidatedNotifier;


  /**
   * @description When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.
   * @default undefined
   */
  invalidatedNotifierKey?: InvalidatedNotifierKey;
}, 'invalidatedNotifier' | 'invalidatedNotifierKey'>
