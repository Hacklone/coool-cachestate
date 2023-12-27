import { firstValueFrom, Observable, ReplaySubject } from 'rxjs';
import { CacheManager } from '../interface/cache-manager.interface';
import { CacheKey, CallArgs, CallContext } from '../interface/cache-key.interface';
import { CacheDataStorage } from '../interface/cache-storage.interface';
import { TimeStampProvider } from '../interface/timestamp.interface';

interface Cache<T = any> {
  readonly key: CacheKey;

  readonly lastArgs: CallArgs;

  readonly context: CallContext;

  readonly subject: ReplaySubject<T>;
}

export class LocalCacheManager<T = any> implements CacheManager {
  private _cacheStore = new Map<CacheKey, Cache>();

  constructor(
    private _cacheDataStorage: CacheDataStorage,
    private _dataProvider: (args: CallArgs) => Observable<T>,
    private _maxAgeInMS: number,
    private _timeStampProvider: TimeStampProvider,
  ) {
  }

  public getCache$(key: CacheKey, args: CallArgs, context: CallContext): Observable<T> {
    const cache = this._getAndEnsureCache(key, args, context);

    this._removeUnusedCachesAsync(key);

    // Do not wait for this Promise
    this._refreshCacheIfOutOfDataAsync(key, cache, args);

    return cache.subject.asObservable();
  }

  public async invalidateAndUpdateAsync(cacheKey: CacheKey | void) {
    await this._removeUnusedCachesAsync(undefined);

    const allToInvalidateAndUpdate: CacheKey[] = cacheKey ? [cacheKey] : Array.from(this._cacheStore.keys());

    await this._cacheDataStorage.removeAsync(allToInvalidateAndUpdate);

    await Promise.all(allToInvalidateAndUpdate.map(async _ => {
      const cache = this._cacheStore.get(_);

      if (cache) {
        await this._refreshCacheData(cache);
      }
    }));
  }

  private _getAndEnsureCache(key: CacheKey, args: CallArgs, context: CallContext): Cache {
    let cache = this._cacheStore.get(key);

    if (!cache) {
      cache = {
        key: key,
        lastArgs: args,
        context: context,
        subject: new ReplaySubject<T>(1),
      };

      this._cacheStore.set(key, cache);
    }

    return cache;
  }

  private async _refreshCacheIfOutOfDataAsync(key: CacheKey, cache: Cache, args: CallArgs) {
    const currentCacheData = await this._cacheDataStorage.getAsync(key);
    const cacheDataNeedsRefresh = !currentCacheData || (currentCacheData.createdAt + this._maxAgeInMS) < this._timeStampProvider.now();

    if (cacheDataNeedsRefresh) {
      await this._refreshCacheData(cache);
    }
  }

  private async _refreshCacheData(cache: Cache) {
    try {
      const data = await firstValueFrom(this._dataProvider.apply(cache.context, <any>cache.lastArgs));

      await this._cacheDataStorage.storeAsync(cache.key, {
        data: data,
        createdAt: this._timeStampProvider.now(),
      });

      cache.subject.next(data);
    } catch (e: any) {
      cache.subject.error(e);
    }
  }

  private async _removeUnusedCachesAsync(except: CacheKey | undefined) {
    const unusedCaches: CacheKey[] = Array.from(this._cacheStore.entries())
      .filter(([key, cache]: [CacheKey, Cache]) => key !== except && !cache.subject.observed)
      .map(([key, cache]: [CacheKey, Cache]) => key);

    if (unusedCaches.length) {
      unusedCaches.forEach(_ => this._cacheStore.delete(_));

      await this._cacheDataStorage.removeAsync(unusedCaches);
    }
  }
}