# @coool/cachestate

A simple to use aspect-oriented way to create caches that can act as a shared state between users.

## Setup
> npm i --save @coool/cachestate

## Basic Usage

### Add CacheState to a function
```typescript
import { CacheStateUpdater } from '@coool/cachestate';

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
```typescript items.service.ts
import { CacheState, CacheStateUpdater } from '@coool/cachestate';
import { Subject } from 'rxjs';

const stateUpdatedNotifier = new Subject<void>();

@CacheState({
  updatedNotifier: stateUpdatedNotifier,
})
function getItem$(itemId: ItemId): Observable<Item> {
  // Get latest version of item from the server
}

@CacheStateUpdater({
  updatedNotifier: stateUpdatedNotifier,
})
function updateItem() {
  // This will invalidate the cache and call the getItem$ function again then update cache consumers with the latest value 
}
```

## Configuration

### CacheState configuration
| Property                 | Description                                                                                                              | Default                                                                                                               | Required |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|----------|
| cacheKey.generator       | Generates the cache key                                                                                                  | Combination of cache key prefix and suffix (combination of class, method name and a hash of the function's arguments) | false    |
| cacheKey.prefixGenerator | Prefix for the cache key                                                                                                 | Combination of class and method name                                                                                  | false    |
| cacheKey.suffixGenerator | Suffix for the cache key                                                                                                 | A hash of the function's arguments                                                                                    | false    |
| cacheDataStorage         | A storage where the cache data is stored                                                                                 | Store cached values locally                                                                                           | false    |
| maxAgeMS                 | Max age of cache in milliseconds                                                                                         | 60000 (1 minute)                                                                                                      | false    |
| updatedObservable        | When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache. | undefined                                                                                                             | false    |
| timestampProvider        | Provides current timestamp, useful for testing                                                                           |                                                                                                                       | false    |

### CacheStateUpdater configuration
| Property          | Description                                                                                                              | Default   | Required |
|-------------------|--------------------------------------------------------------------------------------------------------------------------|-----------|----------|
| updatedNotifier   | When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache. | undefined | true     |
| cacheKeyGenerator | Generates the cache key for the updated notifier                                                                         | undefined | false    |

## Global Configuration

You can set configurations globally across all CacheStates.
Local configuration will take precedence over global configuration.

```typescript
import { GlobalCacheStateConfig } from '@coool/cachestate';

GlobalCacheStateConfig.maxAgeMS = 60000;
```

| Property                 | Description                                                                                                              | Default                                                                                                               | Required |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|----------|
| cacheDataStorage         | A storage where the cache data is stored                                                                                 | Store cached values locally                                                                                           | false    |
| maxAgeMS                 | Max age of cache in milliseconds                                                                                         | 60000 (1 minute)                                                                                                      | false    |
| timestampProvider        | Provides current timestamp, useful for testing                                                                           |                                                                                                                       | false    |


## Inspiration
This project is heavily inspired by [ts-cacheable](https://github.com/angelnikolov/ts-cacheable)

