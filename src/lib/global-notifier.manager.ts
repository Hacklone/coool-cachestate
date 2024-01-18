import { Observable, Subject } from 'rxjs';
import { CacheKey, NotifierKey } from '../interface/cache-key.interface';

type Notifier = Subject<CacheKey | void>;

class GlobalNotifierManagerImpl {
  private _notifiers = new Map<NotifierKey, Notifier>();

  public getNotifierObservable(notifierKey: NotifierKey): Observable<CacheKey | void> {
    return this._getAndEnsureNotifier(notifierKey).asObservable();
  }

  public notify(notifierKey: NotifierKey, cacheKey: CacheKey | undefined) {
    this._getAndEnsureNotifier(notifierKey).next(cacheKey);
  }

  private _getAndEnsureNotifier(notifierKey: NotifierKey): Notifier {
    let notifier = this._notifiers.get(notifierKey);

    if (!notifier) {
      notifier = new Subject<CacheKey | void>();

      this._notifiers.set(notifierKey, notifier);
    }

    return notifier;
  }
}

export const GlobalNotifierManager = new GlobalNotifierManagerImpl();