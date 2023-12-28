import { CacheKey, CallArgs } from '../interface/cache-key.interface';
import { CacheStateInvalidatorConfig } from '../interface/cache-state-invalidator-config.interface';

export function CacheStateInvalidator(config: CacheStateInvalidatorConfig) {
  return function(
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    const originalFunction = descriptor.value;

    if (typeof originalFunction !== 'function') {
      throw new Error('Use @CacheStateInvalidator() decorator on functions!');
    }

    descriptor.value = function(...args: CallArgs) {
      const cacheKey: CacheKey | undefined = config.cacheKeyGenerator?.(args, target, propertyKey, descriptor);

      const result = originalFunction.apply(this, args);

      config.invalidatedNotifier.next(cacheKey);

      return result;
    };
  };
}