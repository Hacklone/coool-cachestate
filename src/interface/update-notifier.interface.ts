import { Observable, Subject } from 'rxjs';
import { CacheKey, CallArgs, NotifierKey } from './cache-key.interface';

export type UpdatedObservable = Observable<CacheKey | void>;
export type UpdatedNotifier = Subject<CacheKey | void>;
export type UpdatedNotifierKey = NotifierKey;

/**
 * Defines a function type `UpdatedNotifierCacheKeyGenerator` that serves as a cache key generator.
 * This function can be used in caching mechanisms where a unique cache key needs to be generated
 * based on method arguments, the target object, and its metadata.
 *
 * @callback UpdatedNotifierCacheKeyGenerator
 *
 * @param {CallArgs} args - The arguments passed to the original method, used to generate the cache key.
 * @param {Object} target - The object on which the method was invoked.
 * @param {string} propertyKey - The name of the method for which the cache key is being generated.
 * @param {PropertyDescriptor} descriptor - The property descriptor of the method.
 *
 * @returns {(CacheKey | undefined)} - A unique cache key for the method, or undefined if no key is generated.
 */
export type UpdatedNotifierCacheKeyGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => CacheKey | undefined;