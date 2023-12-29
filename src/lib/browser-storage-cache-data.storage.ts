import { CacheData, CacheDataStorage, isCacheOutdated } from '../interface/cache-storage.interface';
import { CacheKey } from '../interface/cache-key.interface';

type BrowserStorageData = {
  [key: CacheKey]: CacheData | undefined;
};

export class BrowserStorageCacheDataStorage implements CacheDataStorage {
  constructor(
    private _storage: Storage,
    private _storageKey = 'cachestate',
  ) {
  }

  public async storeAsync(key: CacheKey, data: CacheData): Promise<void> {
    const storageData = this._getAndMaintainStorageData();

    storageData[key] = data;

    this._saveStorageData(storageData);
  }

  public async getAsync(key: CacheKey): Promise<CacheData | undefined> {
    const storageData = this._getAndMaintainStorageData();

    return storageData[key];
  }

  public async removeAsync(keys: CacheKey[]): Promise<void> {
    const storageData = this._getAndMaintainStorageData();

    keys.forEach(_ => {
      storageData[_] = undefined;
    });

    this._saveStorageData(storageData);
  }

  private _getAndMaintainStorageData(): BrowserStorageData {
    const storageData = this._getStorageData();

    return this._removeOutdatedCache(storageData);
  }

  private _getStorageData(): BrowserStorageData {
    return JSON.parse(this._storage.getItem(this._storageKey) || '{}');
  }

  private _saveStorageData(data: BrowserStorageData): void {
    this._storage.setItem(this._storageKey, JSON.stringify(data || '{}'));
  }

  private _removeOutdatedCache(storageData: BrowserStorageData): BrowserStorageData {
    const now = new Date().getTime();

    const result: BrowserStorageData = {};

    for (const [key, data] of Object.entries(storageData)) {
      if (data && !isCacheOutdated(data, now)) {
        result[key] = data;
      }
    }

    return result;
  }
}