import { CacheKey } from './cache-key.interface';
import { Timestamp } from './timestamp.interface';

export interface CacheData {
  readonly data: any;
  readonly maxAgeMS: number;
  readonly createdAt: Timestamp;
}

export function isCacheOutdated(cache: CacheData, now: Timestamp): boolean {
  return (cache.createdAt + cache.maxAgeMS) < now;
}

export interface CacheDataStorage {
  storeAsync(key: CacheKey, data: CacheData): Promise<void>;

  getAsync(key: CacheKey): Promise<CacheData | undefined>;

  removeAsync(keys: CacheKey[]): Promise<void>;
}