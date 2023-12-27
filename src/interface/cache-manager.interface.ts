import { Observable } from 'rxjs';
import { CacheKey } from './cache-key.interface';

export interface CacheManager<T = any> {
  getCache$(key: CacheKey, args: any[]): Observable<T>;

  invalidateAndUpdateAsync(cacheKey: CacheKey | void): Promise<void>;
}