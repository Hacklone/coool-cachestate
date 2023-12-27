import { CacheStateUpdaterConfig } from '../interface/cache-state-updater-config.interface';
import { CacheKey } from '../interface/cache-key.interface';

export function CacheStateUpdater(config: CacheStateUpdaterConfig) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalFunction = descriptor.value;

    if (typeof originalFunction !== 'function') {
      throw new Error('Use @CacheStateUpdater() decorator on functions!');
    }

    descriptor.value = function(args: any[]) {
      const cacheKey: CacheKey | undefined = config.cacheKeyGenerator?.(args, target, propertyKey, descriptor);

      const result = originalFunction(...args);

      config.updatedNotifier.next(cacheKey);

      return result;
    };
  };
}