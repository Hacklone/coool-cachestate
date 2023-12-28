import { firstValueFrom, Observable, ReplaySubject, Subject, throttleTime } from 'rxjs';
import { CacheManager } from '../interface/cache-manager.interface';
import { CacheKey, CallArgs, CallContext } from '../interface/cache-key.interface';
import { CacheDataStorage, isCacheOutdated } from '../interface/cache-storage.interface';
import { TimestampProvider } from '../interface/timestamp.interface';

interface Cache<T = any> {
  readonly key: CacheKey;

  readonly lastArgs: CallArgs;

  readonly context: CallContext;

  readonly subject: ReplaySubject<T>;

  readonly dataRequestedSubject: Subject<void>;

  initialized: boolean;
}

export class LocalCacheManager<T = any> implements CacheManager {
  private _cacheStore = new Map<CacheKey, Cache>();

  constructor(
    private _cacheDataStorage: CacheDataStorage,
    private _dataProvider: (args: CallArgs) => Observable<T>,
    private _maxAgeInMS: number,
    private _timeStampProvider: TimestampProvider,
  ) {
  }

  public getCache$(key: CacheKey, args: CallArgs, context: CallContext): Observable<T> {
    const cache = this._getAndEnsureCache(key, args, context);

    this._removeUnobservedCachesAsync(key);

    // Do not wait for this Promise
    this._refreshCacheIfOutOfDataAsync(key, cache);

    return cache.subject.asObservable();
  }

  public async invalidateAndUpdateAsync(cacheKey: CacheKey | void) {
    await this._removeUnobservedCachesAsync(undefined);

    const allToInvalidateAndUpdate: CacheKey[] = cacheKey ? [cacheKey] : Array.from(this._cacheStore.keys());

    await this._cacheDataStorage.removeAsync(allToInvalidateAndUpdate);

    allToInvalidateAndUpdate.forEach(_ => {
      const cache = this._cacheStore.get(_);

      if (cache) {
        this._requestCacheDataRefresh(cache);
      }
    });
  }

  private _getAndEnsureCache(key: CacheKey, args: CallArgs, context: CallContext): Cache {
    let cache = this._cacheStore.get(key);

    if (!cache) {
      cache = this._createCache(key, args, context);
    }

    return cache;
  }

  private _createCache(key: CacheKey, args: CallArgs, context: CallContext): Cache {
    const cache: Cache = {
      key: key,
      lastArgs: args,
      context: context,
      subject: new ReplaySubject<T>(1),
      initialized: false,
      dataRequestedSubject: new Subject(),
    };

    cache.dataRequestedSubject
      .pipe(
        throttleTime(150, undefined, { leading: true, trailing: false }),
      )
      .subscribe(async () => {
        await this._refreshDataAsync(cache!);
      });

    this._cacheStore.set(key, cache);

    return cache;
  }

  private async _refreshCacheIfOutOfDataAsync(key: CacheKey, cache: Cache) {
    const currentCacheData = await this._cacheDataStorage.getAsync(key);
    const cacheDataNeedsRefresh = !currentCacheData || isCacheOutdated(currentCacheData, this._timeStampProvider.now());

    if (cacheDataNeedsRefresh) {
      this._requestCacheDataRefresh(cache);
    } else if (!cache.initialized && currentCacheData) {
      this._setCacheData(cache, currentCacheData.data);
    }
  }

  private _requestCacheDataRefresh(cache: Cache) {
    cache.dataRequestedSubject.next();
  }

  private async _refreshDataAsync(cache: Cache) {
    try {
      const data = await firstValueFrom(this._dataProvider.apply(cache.context, <any>cache.lastArgs));

      await this._cacheDataStorage.storeAsync(cache.key, {
        data: data,
        maxAgeMS: this._maxAgeInMS,
        createdAt: this._timeStampProvider.now(),
      });

      this._setCacheData(cache, data);
    } catch (e: any) {
      cache.subject.error(e);
    }
  }

  private async _removeUnobservedCachesAsync(except: CacheKey | undefined) {
    const unusedCaches = Array.from(this._cacheStore.entries())
      .filter(([key, cache]: [CacheKey, Cache]) => key !== except && !cache.subject.observed)
      .map(([key, cache]: [CacheKey, Cache]) => cache);

    unusedCaches.forEach(_ => this._removeCache(_));
  }

  private async _removeCache(cache: Cache) {
    cache.dataRequestedSubject.complete();

    this._cacheStore.delete(cache.key);
  }

  private _setCacheData(cache: Cache, data: any) {
    cache.subject.next(data);

    cache.initialized = true;
  }
}