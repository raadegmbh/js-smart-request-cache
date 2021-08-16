import RequestResponseType from "./RequestResponseType";
class RequestHelper {
    static ClearCache() {
        RequestHelper._cache.clear();
    }
    static GET(url, fetchOptions = {}, forceRequest = false, responseType = RequestResponseType.Json) {
        if (forceRequest === true) {
            return new Promise((resolve, reject) => {
                fetch(url, fetchOptions)
                    .then((response) => {
                    return (responseType === RequestResponseType.Json) ? response.json() : response.text();
                })
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
            let _promise;
            if (RequestHelper._requests.has(url) === true) {
                _promise = RequestHelper._requests.get(url);
            }
            if (_promise !== undefined) {
                RequestHelper.AddEvent(url, resolve, reject);
                return;
            }
            if (RequestHelper._cache.has(url) === true) {
                const TEMP_CACHE_VALUE = RequestHelper._cache.get(url);
                if (TEMP_CACHE_VALUE !== undefined) {
                    if (RequestHelper.GetExpired(TEMP_CACHE_VALUE.created) > new Date()) {
                        resolve(TEMP_CACHE_VALUE.data);
                        return;
                    }
                    else {
                        RequestHelper._cache.delete(url);
                    }
                }
            }
            RequestHelper.AddEvent(url, resolve, reject);
            _promise = fetch(url, fetchOptions);
            RequestHelper._requests.set(url, _promise);
            RequestHelper.HandlePromise(url, _promise, responseType);
            return;
        });
    }
    static HandlePromise(url, promise, responseType) {
        promise
            .then((response) => {
            return (responseType === RequestResponseType.Json) ? response.json() : response.text();
        })
            .then((data) => {
            if (RequestHelper._requests.has(url) === true) {
                RequestHelper._requests.delete(url);
            }
            RequestHelper._cache.set(url, { created: new Date(), data, type: responseType });
            const TEMP_EVENT_VALUE = RequestHelper._events.get(url);
            if (TEMP_EVENT_VALUE !== undefined) {
                for (let i = 0; i < TEMP_EVENT_VALUE.length; i++) {
                    const EVENT_VALUE = TEMP_EVENT_VALUE[i];
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
            const TEMP_EVENT_VALUE = RequestHelper._events.get(url);
            if (TEMP_EVENT_VALUE !== undefined) {
                for (let i = 0; i < TEMP_EVENT_VALUE.length; i++) {
                    const EVENT_VALUE = TEMP_EVENT_VALUE[i];
                    EVENT_VALUE.reject(e);
                }
            }
            RequestHelper._events.delete(url);
            return;
        });
    }
    static AddEvent(url, resolve, reject) {
        var _a;
        if (RequestHelper._events.has(url) === true) {
            const TEMP_EVENT_VALUE = (_a = RequestHelper._events.get(url)) !== null && _a !== void 0 ? _a : [];
            TEMP_EVENT_VALUE.push({
                resolve,
                reject,
            });
            RequestHelper._events.set(url, TEMP_EVENT_VALUE);
        }
        else {
            RequestHelper._events.set(url, [{
                    reject,
                    resolve,
                }]);
        }
    }
    static GetExpired(created) {
        created.setTime(created.getTime() + RequestHelper.timeToExpireInMilliseconds);
        return created;
    }
}
RequestHelper._requests = new Map();
RequestHelper._events = new Map();
RequestHelper._cache = new Map();
RequestHelper.timeToExpireInMilliseconds = 10000;
export default RequestHelper;
//# sourceMappingURL=RequestHelper.js.map