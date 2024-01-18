import { Observable, Subject } from 'rxjs';
import { CacheKey, CallArgs, NotifierKey } from './cache-key.interface';

export type UpdatedObservable = Observable<CacheKey | void>;
export type UpdatedNotifier = Subject<CacheKey | void>;
export type UpdatedNotifierKey = NotifierKey;

export type UpdatedNotifierCacheKeyGenerator = (args: CallArgs, target: Object, propertyKey: string, descriptor: PropertyDescriptor) => CacheKey | undefined;