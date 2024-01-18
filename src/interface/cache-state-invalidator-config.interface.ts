import {
  InvalidatedNotifier,
  InvalidatedNotifierCacheKeyGenerator,
  InvalidatedNotifierKey,
} from './invalidate-notifier.interface';

export type CacheStateInvalidatorConfig = {
  /**
   * @description generates the cache key for the updated notifier
   * @default undefined
   */
  cacheKeyGenerator?: InvalidatedNotifierCacheKeyGenerator;
} &
  (
    {
      /**
       * @description When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.
       * @default undefined
       */
      invalidatedNotifier: InvalidatedNotifier;
      invalidatedNotifierKey: never;
    }
    |
    {
      /**
       * @description When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.
       * @default undefined
       */
      invalidatedNotifierKey: InvalidatedNotifierKey;
      invalidatedNotifier: never;
    }
    );