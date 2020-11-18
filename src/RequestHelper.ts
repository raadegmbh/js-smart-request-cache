import RequestEntries from "./RequestEntries";
import RequestWaitEvent from "./RequestWaitEvent";
import RequestCache from './RequestCache';

class RequestHelper {
    private static _requests: RequestEntries = {};
    private static _events: RequestWaitEvent = {};
    private static _cache: RequestCache = {};
    public static timeToExpireInMilliseconds: number = 10000;

    static GET(url: string, fetchOptions: object = {}, forceRequest: boolean = false): Promise<any> {

        if (forceRequest === true) {
            return new Promise((resolve, reject) => {
                fetch(url, fetchOptions)
                    .then((response) => response.json())
                    .then((data) => {
                        resolve(data);
                        return;
                    })
                    .catch((e) => {
                        reject(e);
                        return;
                    });
            });
        }

        return new Promise((resolve, reject) => {
            let _promise = RequestHelper._requests[url];

            //#region HANDLE_EXISTING
            if (_promise) {
                RequestHelper.AddEvent(url, resolve, reject);
                return;
            }
            //#endregion HANDLE_EXISTING

            //#region HANDLE_CACHED
            if (RequestHelper._cache[url]) {
                if (RequestHelper.GetExpired(RequestHelper._cache[url].created) > new Date()) {
                    resolve(RequestHelper._cache[url].data);
                    return;
                } else {
                    RequestHelper._cache[url] = undefined;
                }
            }
            //#endregion HANDLE_CACHED

            //#region HANDLE_NEW
            RequestHelper.AddEvent(url, resolve, reject);
            _promise = fetch(url, fetchOptions);
            RequestHelper._requests[url] = _promise;
            RequestHelper.HandlePromise(url, _promise);
            return;
            //#endregion HANDLE_NEW
        });
    }

    private static HandlePromise(url: string, promise: Promise<any>): void {
        promise
            .then((response) => response.json())
            .then((data) => {
                delete RequestHelper._requests[url];
                RequestHelper._cache[url] = { created: new Date(), data };

                while (RequestHelper._events[url].length > 0) {
                    RequestHelper._events[url][0].resolve(data);
                    RequestHelper._events[url].splice(0, 1);
                }

                return;
            })
            .catch((e) => {
                delete RequestHelper._requests[url];

                while (RequestHelper._events[url].length > 0) {
                    RequestHelper._events[url][0].reject(e);
                    RequestHelper._events[url].splice(0, 1);
                }

                return;
            });
    }

    private static AddEvent(url: string, resolve: Function, reject: Function): void {
        if (RequestHelper._events[url] instanceof Array) {
            RequestHelper._events[url].push({
                resolve,
                reject,
            });
        } else {
            RequestHelper._events[url] = [{
                resolve,
                reject,
            }];
        }
    }

    private static GetExpired(created: Date): Date {
        created.setTime(created.getTime() + RequestHelper.timeToExpireInMilliseconds);
        return created;
    }
}

export default RequestHelper;