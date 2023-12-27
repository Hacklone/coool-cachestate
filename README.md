# @coool/cachestate

A simple to use aspect-oriented way to create caches that can act as a shared state between users.

## Setup
> npm i --save @coool/cachestate

## Basic Usage

### Cached State Provider
```typescript items.service.ts
import { CacheState, CacheStateUpdater } from '@coool/cachestate';
import { Subject } from 'rxjs';

const stateUpdatedNotifier = new Subject<void>(); 

export class ItemsService {
  @CacheState({
    updatedNotifier: stateUpdatedNotifier,
  })
  public getItemFromServer$(itemId: ItemId): Observable<Item> {
    // Get latest version of item from the server
  }

  @CacheStateUpdater({
    updatedNotifier: stateUpdatedNotifier,
  })
  public updateItem() {
    // Update the item on the server
    // This will force the cache to get the latest version of the item from the server again 
  }
}
```

### Cached State Consumer
```typescript
import { ItemsService } from 'items.service';

export class MyConsumer {
  constructor(
    private _itemsService: ItemsService,
  ) {
  }
  
  protected myItem$ = this._itemsService.getItemFromServer$('1');
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
| timeStampProvider        | Provides current timestamp, useful for testing                                                                           |                                                                                                                       | false    |

### CacheStateUpdater configuration
| Property          | Description                                                                                                              | Default   | Required |
|-------------------|--------------------------------------------------------------------------------------------------------------------------|-----------|----------|
| updatedNotifier   | When emits the cache is invalidated and updated. If CacheKey is passed then only that cache otherwise all related cache. | undefined | true     |
| cacheKeyGenerator | Generates the cache key for the updated notifier                                                                         | undefined | false    |
|                   |                                                                                                                          |           |          |

## Inspiration
This project is heavily inspired by [ts-cacheable](https://github.com/angelnikolov/ts-cacheable)

