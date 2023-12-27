import { Observable } from 'rxjs';
import { CacheKey, CallArgs, CallContext } from './cache-key.interface';

export interface CacheManager<T = any> {
  getCache$(key: CacheKey, args: CallArgs, context: CallContext): Observable<T>;

  invalidateAndUpdateAsync(cacheKey: CacheKey | void): Promise<void>;
}