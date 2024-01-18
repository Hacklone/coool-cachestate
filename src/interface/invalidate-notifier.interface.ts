import { Observable, Subject } from 'rxjs';
import { CacheKey, CallArgs, NotifierKey } from './cache-key.interface';

export type InvalidatedObservable = Observable<CacheKey | void>;
export type InvalidatedNotifier = Subject<CacheKey | void>;
export type InvalidatedNotifierKey = NotifierKey;

export type InvalidatedNotifierCacheKeyGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => CacheKey | undefined;