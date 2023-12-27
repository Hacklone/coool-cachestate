import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { CacheManager } from '../interface/cache-manager.interface';
import { CacheKey } from '../interface/cache-key.interface';
import { CacheDataStorage } from '../interface/cache-storage.interface';
import { TimeStampProvider } from '../interface/timestamp.interface';

interface Cache<T = any> {
  readonly lastArgs: any[];

  readonly subject: ReplaySubject<T>;
}

export class LocalCacheManager<T = any> implements CacheManager {
  private _cacheStore = new Map<CacheKey, Cache>();

  constructor(
    private _cacheDataStorage: CacheDataStorage,
    private _dataProvider: (args: any[]) => Observable<T>,
    private _maxAgeInMS: number,
    private _timeStampProvider: TimeStampProvider,
  ) {
  }

  public getCache$(key: CacheKey, args: any[]): Observable<T> {
    const cache = this._getAndEnsureCache(key, args);

    this._removeUnusedCachesAsync();

    // Do not wait for this Promise
    this._refreshCacheIfOutOfDataAsync(key, cache, args);

    return cache.subject.asObservable();
  }

  public async invalidateAndUpdateAsync(cacheKey: CacheKey | void) {
    await this._removeUnusedCachesAsync();

    const allToInvalidateAndUpdate: CacheKey[] = cacheKey ? [cacheKey] : Array.from(this._cacheStore.keys());

    await this._cacheDataStorage.removeAsync(allToInvalidateAndUpdate);

    await Promise.all(allToInvalidateAndUpdate.map(async _ => {
      const cache = this._getAndEnsureCache(_);

      await this._refreshCacheData(_, cache, cache.lastArgs);
    }));
  }

  private _getAndEnsureCache(key: CacheKey, args: any[] = []): Cache {
    let cache = this._cacheStore.get(key);

    if (!cache) {
      cache = {
        lastArgs: args,
        subject: new ReplaySubject<T>(1),
      };

      this._cacheStore.set(key, cache);
    }

    return cache;
  }

  private async _refreshCacheIfOutOfDataAsync(key: CacheKey, cache: Cache, args: any[]) {
    const currentCacheData = await this._cacheDataStorage.getAsync(key);
    const cacheDataNeedsRefresh = !currentCacheData || (currentCacheData.createdAt + this._maxAgeInMS) < this._timeStampProvider.now();

    if (cacheDataNeedsRefresh) {
      await this._refreshCacheData(key, cache, args);
    }
  }

  private async _refreshCacheData(key: CacheKey, cache: Cache, args: any[]) {
    try {
      const data = await firstValueFrom(this._dataProvider(args));

      await this._cacheDataStorage.storeAsync(key, {
        data: data,
        createdAt: this._timeStampProvider.now(),
      });

      cache.subject.next(data);
    } catch {

    }
  }

  private async _removeUnusedCachesAsync() {
    const unusedCaches: CacheKey[] = Array.from(this._cacheStore.entries())
      .filter(([key, cache]: [CacheKey, Cache]) => !cache.subject.observed)
      .map(([key, cache]: [CacheKey, Cache]) => key);

    unusedCaches.forEach(_ => this._cacheStore.delete(_));

    await this._cacheDataStorage.removeAsync(unusedCaches);
  }
}