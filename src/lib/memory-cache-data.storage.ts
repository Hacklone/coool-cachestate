import { CacheData, CacheDataStorage, isCacheOutdated } from '../interface/cache-storage.interface';
import { CacheKey } from '../interface/cache-key.interface';
import { TimestampProvider } from '../interface/timestamp.interface';

export class MemoryCacheDataStorage implements CacheDataStorage {
  private _cacheStore = new Map<CacheKey, CacheData>();

  constructor(
    private _timestampProvider: TimestampProvider,
  ) {
  }

  public async storeAsync(key: CacheKey, data: CacheData): Promise<void> {
    this._removeOutdatedCache();

    this._cacheStore.set(key, data);
  }

  public async getAsync(key: CacheKey): Promise<CacheData | undefined> {
    this._removeOutdatedCache();

    return this._cacheStore.get(key);
  }

  public async removeAsync(keys: CacheKey[]): Promise<void> {
    this._removeOutdatedCache();

    keys.forEach(_ => this._cacheStore.delete(_));
  }

  private _removeOutdatedCache() {
    const now = this._timestampProvider.now();

    Array.from(this._cacheStore.entries())
      .filter(([key, cache]) => isCacheOutdated(cache, now))
      .map(([key]) => key)
      .forEach(_ => this._cacheStore.delete(_));
  }
}