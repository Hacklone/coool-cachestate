import { Subject } from 'rxjs';

export const invalidateAllCacheSubject = new Subject<void>();

export function invalidateAllCache() {
  invalidateAllCacheSubject.next();
}

export const invalidateAndUpdateAllCacheSubject = new Subject<void>();

export function invalidateAndUpdateAllCache() {
  invalidateAndUpdateAllCacheSubject.next();
}