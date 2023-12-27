import { CacheData, CacheDataStorage } from '../interface/cache-storage.interface';
import { CacheKey } from '../interface/cache-key.interface';

export class LocalCacheDataStorage implements CacheDataStorage {
  private _cacheStore = new Map<CacheKey, CacheData>();

  public async storeAsync(key: CacheKey, data: CacheData): Promise<void> {
    this._cacheStore.set(key, data);
  }

  public async getAsync(key: CacheKey): Promise<CacheData | undefined> {
    return this._cacheStore.get(key);
  }

  public async removeAsync(keys: CacheKey[]): Promise<void> {
    keys.forEach(_ => this._cacheStore.delete(_));
  }
}