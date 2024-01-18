# @coool/cachestate

A simple-to-use, minimal boilerplate flexible cached state.

## Features

✅ Caching <br>
✅ State Management <br>
✅ Updates for cache consumers <br>
✅ Works with any framework <br>
✅ Local Storage Support <br>
✅ Custom Storage Asynchronous Support <br>
✅ Handles Simultaneous Requests <br>
✅ Automatic & Manual Cache Busting <br>
✅ Aspect-Oriented (Decorators) <br>
✅ Out-of-the-box LocalStorage and SessionStorage cache data storage <br>

## Install

```shell script
$ npm i --save @coool/cachestate
```

## Basic Usage

### Add CacheState to a function

```typescript
import { CacheState } from '@coool/cachestate';

@CacheState()
function getItem$(itemId: ItemId): Observable<Item> {
  // Get latest version of item from the server
}
```

### Consume CacheState

```typescript
getItem$('1')
  .subscribe(item => {
    // You'll receive initial cached value and updates here
  });
```

### Notify the CacheState that the value needs updating

```typescript
import { CacheState, CacheStateUpdater } from '@coool/cachestate';

@CacheState({
  updatedNotifierKey: 'items-updated',
})
function getItem$(itemId: ItemId): Observable<Item> {
  // Get latest version of item from the server
}

@CacheStateUpdater({
  updatedNotifierKey: 'items-updated',
})
function updateItem() {
  // This will invalidate the cache and call the getItem$ function again then update cache consumers with the latest value 
}
```

## Use-cases

### Global Configuration

You can set configurations globally across all CacheStates.
Local configuration will take precedence over global configuration.

```typescript
import { GlobalCacheStateConfig } from '@coool/cachestate';

GlobalCacheStateConfig.maxAgeMS = 5 * 60 * 1000;
```

### Invalidate cache without requesting update

```typescript
import { CacheState, CacheStateInvalidator } from '@coool/cachestate';
import { Subject } from 'rxjs';

const cacheInvalidatedNotifier = new Subject<void>();

@CacheState({
  invalidatedNotifier: cacheInvalidatedNotifier,
})
function getItem$(itemId: ItemId): Observable<Item> {
}

@CacheStateInvalidator({
  invalidatedNotifier: cacheInvalidatedNotifier,
})
function updateItem() {
  // This will invalidate the cache and call the getItem$ function again then update cache consumers with the latest value 
}
```

### Invalidate all cache globally

```typescript
import { invalidateAllCache } from '@coool/cachestate';

invalidateAllCache();
```

### Invalidate and update all cache globally

```typescript
import { invalidateAndUpdateAllCache } from '@coool/cachestate';

invalidateAndUpdateAllCache();
```

### LocalStorage data storage

```typescript
import { GlobalCacheStateConfig, BrowserStorageCacheDataStorage } from '@coool/cachestate';

GlobalCacheStateConfig.cacheDataStorage = new BrowserStorageCacheDataStorage(window.localStorage);
```

### SessionStorage data storage

```typescript
import { GlobalCacheStateConfig, BrowserStorageCacheDataStorage } from '@coool/cachestate';

GlobalCacheStateConfig.cacheDataStorage = new BrowserStorageCacheDataStorage(window.sessionStorage);
```

### Custom cache data storage

```typescript
import { CacheDataStorage, GlobalCacheStateConfig } from '@coool/cachestate';

class MyCacheDataStorage implements CacheDataStorage {
  // Implement CacheDataStorage interface to store, retrieve and delete cache data
}

GlobalCacheStateConfig.cacheDataStorage = new MyCacheDataStorage(window.localStorage);
```

## API

### CacheState configuration

| Property                 | Description                                                                                                              | Default                                                                                                               | Required |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|----------|
| cacheKey.generator       | Generates the cache key                                                                                                  | Combination of cache key prefix and suffix (combination of class, method name and a hash of the function's arguments) | false    |
| cacheKey.prefixGenerator | Prefix for the cache key                                                                                                 | Combination of class and method name                                                                                  | false    |
| cacheKey.suffixGenerator | Suffix for the cache key                                                                                                 | A hash of the function's arguments                                                                                    | false    |
| cacheDataStorage         | A storage where the cache data is stored                                                                                 | Store cached values locally                                                                                           | false    |
| maxAgeMS                 | Max age of cache in milliseconds                                                                                         | 60000 (1 minute)                                                                                                      | false    |
| updatedObservable        | When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache. | undefined                                                                                                             | false    |
| updatedObservableKey     | When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache. | undefined                                                                                                             | false    |
| updateOnlySpecific       | When updated notifier fires only update if specific cache key is defined.                                                | false                                                                                                                 | false    |
| invalidatedObservable    | When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.             | undefined                                                                                                             | false    |
| invalidatedObservableKey | When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache.             | undefined                                                                                                             | false    |
| invalidateOnlySpecific   | When invalidated notifier fires only update if specific cache key is defined.                                            | false                                                                                                                 | false    |
| timestampProvider        | Provides current timestamp, useful for testing                                                                           |                                                                                                                       | false    |

### CacheStateUpdater configuration

| Property           | Description                                                                                                              | Default   | Required                         |
|--------------------|--------------------------------------------------------------------------------------------------------------------------|-----------|----------------------------------|
| updatedNotifier    | When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache. | undefined | true (OR use updatedNotifierKey) |
| updatedNotifierKey | Global key identifying updatedNotifier                                                                                   | undefined | true (OR use updatedNotifier)    |
| cacheKeyGenerator  | Generates the cache key for the updated notifier                                                                         | undefined | false                            |

### CacheStateInvalidator configuration

| Property               | Description                                                                                                  | Default   | Required                             |
|------------------------|--------------------------------------------------------------------------------------------------------------|-----------|--------------------------------------|
| invalidatedNotifier    | When emits the cache is invalidated. If CacheKey is passed then only that cache otherwise all related cache. | undefined | true (OR use invalidatedNotifierKey) |
| invalidatedNotifierKey | Global key identifying invalidatedNotifier.                                                                  | undefined | true (OR use invalidatedNotifier)    |
| cacheKeyGenerator      | Generates the cache key for the updated notifier                                                             | undefined | false                                |

### Global configuration

| Property          | Description                                    | Default                     | Required |
|-------------------|------------------------------------------------|-----------------------------|----------|
| cacheDataStorage  | A storage where the cache data is stored       | Store cached values locally | false    |
| maxAgeMS          | Max age of cache in milliseconds               | 60000 (1 minute)            | false    |
| timestampProvider | Provides current timestamp, useful for testing |                             | false    |

## Inspiration

This project is inspired by [ts-cacheable](https://github.com/angelnikolov/ts-cacheable)

