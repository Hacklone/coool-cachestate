import { Observable, Subject } from 'rxjs';
import { CacheKey, CallArgs } from './cache-key.interface';

export type InvalidatedObservable = Observable<CacheKey | void>;
export type InvalidatedNotifier = Subject<CacheKey | void>;

export type InvalidatedNotifierCacheKeyGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => CacheKey | undefined;