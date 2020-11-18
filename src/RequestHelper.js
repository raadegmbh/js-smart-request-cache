"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestHelper = (function () {
    function RequestHelper() {
    }
    RequestHelper.GET = function (url, fetchOptions, forceRequest) {
        if (fetchOptions === void 0) { fetchOptions = {}; }
        if (forceRequest === void 0) { forceRequest = false; }
        if (forceRequest === true) {
            return new Promise(function (resolve, reject) {
                fetch(url, fetchOptions)
                    .then(function (response) { return response.json(); })
                    .then(function (data) {
                    resolve(data);
                    return;
                })
                    .catch(function (e) {
                    reject(e);
                    return;
                });
            });
        }
        return new Promise(function (resolve, reject) {
            var _promise = RequestHelper._requests[url];
            if (_promise) {
                RequestHelper.AddEvent(url, resolve, reject);
                return;
            }
            if (RequestHelper._cache[url]) {
                if (RequestHelper.GetExpired(RequestHelper._cache[url].created) > new Date()) {
                    resolve(RequestHelper._cache[url].data);
                    return;
                }
                else {
                    RequestHelper._cache[url] = undefined;
                }
            }
            RequestHelper.AddEvent(url, resolve, reject);
            _promise = fetch(url, fetchOptions);
            RequestHelper._requests[url] = _promise;
            RequestHelper.HandlePromise(url, _promise);
            return;
        });
    };
    RequestHelper.HandlePromise = function (url, promise) {
        promise
            .then(function (response) { return response.json(); })
            .then(function (data) {
            delete RequestHelper._requests[url];
            RequestHelper._cache[url] = { created: new Date(), data: data };
            while (RequestHelper._events[url].length > 0) {
                RequestHelper._events[url][0].resolve(data);
                RequestHelper._events[url].splice(0, 1);
            }
            return;
        })
            .catch(function (e) {
            delete RequestHelper._requests[url];
            while (RequestHelper._events[url].length > 0) {
                RequestHelper._events[url][0].reject(e);
                RequestHelper._events[url].splice(0, 1);
            }
            return;
        });
    };
    RequestHelper.AddEvent = function (url, resolve, reject) {
        if (RequestHelper._events[url] instanceof Array) {
            RequestHelper._events[url].push({
                resolve: resolve,
                reject: reject,
            });
        }
        else {
            RequestHelper._events[url] = [{
                    resolve: resolve,
                    reject: reject,
                }];
        }
    };
    RequestHelper.GetExpired = function (created) {
        created.setTime(created.getTime() + RequestHelper.timeToExpireInMilliseconds);
        return created;
    };
    RequestHelper._requests = {};
    RequestHelper._events = {};
    RequestHelper._cache = {};
    RequestHelper.timeToExpireInMilliseconds = 10000;
    return RequestHelper;
}());
exports.default = RequestHelper;
//# sourceMappingURL=RequestHelper.js.map