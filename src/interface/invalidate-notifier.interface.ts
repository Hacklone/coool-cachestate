import { Observable, Subject } from 'rxjs';
import { CacheKey, CallArgs, NotifierKey } from './cache-key.interface';

export type InvalidatedObservable = Observable<CacheKey | void>;
export type InvalidatedNotifier = Subject<CacheKey | void>;
export type InvalidatedNotifierKey = NotifierKey;

/**
 * A type definition for a function that generates a cache key for an invalidated notifier.
 *
 * This function is used within caching mechanisms to produce a unique key based on the method call arguments,
 * the target object, the method name, and its descriptor. It helps identify which cached data should be invalidated.
 *
 * The function accepts the following parameters:
 *
 * @typedef {InvalidatedNotifierCacheKeyGenerator}
 *
 * @param {CallArgs} args - The arguments passed to the method. This is typically an array or object representing
 *                          the values provided when the method is invoked.
 * @param {Object} target - The instance of the class or object that the method belongs to.
 * @param {string} propertyKey - The name of the property/method for which the cache key should be generated.
 * @param {PropertyDescriptor} descriptor - The property descriptor of the method to provide additional metadata about it.
 *
 * @returns {CacheKey | undefined} A unique cache key to identify the data or `undefined` if no key can be generated.
 */
export type InvalidatedNotifierCacheKeyGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => CacheKey | undefined;