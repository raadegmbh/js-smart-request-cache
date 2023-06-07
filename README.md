# js-smart-request-cache

## `RequestHelper`

**Signature**:

```js
class RequestHelper {
    static timeToExpireInMilliseconds: number; // the time (milliseconds) it takes to invalidate the cached value.
    static GET(url: string, fetchOptions?: object, forceRequest?: boolean, responseType?: RequestResponseType, acceptableStatusCodes?: number[]): Promise<any>;
}
```

**Example**:
```js
RequestHelper.timeToExpireInMilliseconds = 10000;

RequestHelper.GET("https://example.com/api/orders?id=1", {
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    false,
    RequestResponseType.Json,
    [200, 201]
})
    .then((response) => {
        // Handle Response ...
    })
    .catch((e) => {
        // Handle Error ...
    });
```