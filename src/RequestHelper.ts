import RequestEntries from "./RequestEntries";
import RequestWaitEvent from "./RequestWaitEvent";
import RequestCache from './RequestCache';
import RequestResponseType from "./RequestResponseType";
import RequestCacheData from "./RequestCacheData";
import RequestPromise from "./RequestEvent";

class RequestHelper {
    private static _requests: RequestEntries = new Map();
    private static _events: RequestWaitEvent = new Map();
    private static _cache: RequestCache = new Map();
    public static timeToExpireInMilliseconds: number = 10000;

    static ClearCache(): void {
        RequestHelper._cache.clear();
    }

    static GET(url: string, fetchOptions: object = {}, forceRequest: boolean = false, responseType: RequestResponseType = RequestResponseType.Json): Promise<any> {
        if (forceRequest === true) {
            return new Promise((resolve: any, reject: any) => {
                fetch(url, fetchOptions)
                    .then((response: any) => {
                        return (responseType === RequestResponseType.Json) ? response.json() : response.text();
                    })
                    .then((data: any) => {
                        resolve(data);
                        return;
                    })
                    .catch((e: any) => {
                        reject(e);
                        return;
                    });
            });
        }

        return new Promise((resolve: any, reject: any) => {

            let _promise: undefined | Promise<any>;

            if (RequestHelper._requests.has(url) === true) {
                _promise = RequestHelper._requests.get(url);

            }

            // -----------------------------------------
            // HANDLE_EXISTING
            // -----------------------------------------
            if (_promise !== undefined) {
                RequestHelper.AddEvent(url, resolve, reject);
                return;
            }


            // -----------------------------------------
            // HANDLE_CACHED
            // -----------------------------------------
            if (RequestHelper._cache.has(url) === true) {
                const TEMP_CACHE_VALUE: undefined | RequestCacheData = RequestHelper._cache.get(url);
                if (TEMP_CACHE_VALUE !== undefined) {
                    if (RequestHelper.GetExpired(TEMP_CACHE_VALUE.created) > new Date()) {
                        resolve(TEMP_CACHE_VALUE.data);
                        return;
                    } else {
                        RequestHelper._cache.delete(url);
                    }
                }
            }


            // -----------------------------------------
            // HANDLE_NEW
            // -----------------------------------------
            RequestHelper.AddEvent(url, resolve, reject);
            _promise = fetch(url, fetchOptions);
            RequestHelper._requests.set(url, _promise);
            RequestHelper.HandlePromise(url, _promise, responseType);
            return;
        });
    }

    private static HandlePromise(url: string, promise: Promise<any>, responseType: RequestResponseType): void {
        promise
            .then((response: any) => {
                return (responseType === RequestResponseType.Json) ? response.json() : response.text();
            })
            .then((data) => {
                if (RequestHelper._requests.has(url) === true) {
                    RequestHelper._requests.delete(url);
                }

                RequestHelper._cache.set(url, { created: new Date(), data, type: responseType });

                const TEMP_EVENT_VALUE: RequestPromise[] | undefined = RequestHelper._events.get(url);

                if (TEMP_EVENT_VALUE !== undefined) {
                    for (let i = 0; i < TEMP_EVENT_VALUE.length; i++) {
                        const EVENT_VALUE: RequestPromise = TEMP_EVENT_VALUE[i];
                        EVENT_VALUE.resolve(data);
                    }
                }

                RequestHelper._events.delete(url);
                return;
            })
            .catch((e) => {
                if (RequestHelper._requests.has(url) === true) {
                    RequestHelper._requests.delete(url);
                }

                const TEMP_EVENT_VALUE: RequestPromise[] | undefined = RequestHelper._events.get(url);

                if (TEMP_EVENT_VALUE !== undefined) {
                    for (let i = 0; i < TEMP_EVENT_VALUE.length; i++) {
                        const EVENT_VALUE: RequestPromise = TEMP_EVENT_VALUE[i];
                        EVENT_VALUE.reject(e);
                    }
                }

                RequestHelper._events.delete(url);
                return;
            });
    }

    private static AddEvent(url: string, resolve: Function, reject: Function): void {
        if (RequestHelper._events.has(url) === true) {
            const TEMP_EVENT_VALUE: RequestPromise[] = RequestHelper._events.get(url) ?? [];
            TEMP_EVENT_VALUE.push({
                resolve,
                reject,
            });
            RequestHelper._events.set(url, TEMP_EVENT_VALUE);
        } else {
            RequestHelper._events.set(url, [{
                reject,
                resolve,
            }]);
        }
    }

    private static GetExpired(created: Date): Date {
        created.setTime(created.getTime() + RequestHelper.timeToExpireInMilliseconds);
        return created;
    }
}

export default RequestHelper;