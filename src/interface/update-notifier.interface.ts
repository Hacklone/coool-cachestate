import { Observable, Subject } from 'rxjs';
import { CacheKey } from './cache-key.interface';

export type UpdatedObservable = Observable<CacheKey | void>;
export type UpdatedNotifier = Subject<CacheKey | void>;