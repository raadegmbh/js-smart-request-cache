# js-smart-request-cache

## `RequestHelper`

**Signature**:

```js
class RequestHelper {
    static timeToExpireInMilliseconds: number; // the time (milliseconds) it takes to invalidate the cached value.
    static GET(url: string, fetchOptions?: object, forceRequest?: boolean): Promise<any>;
}
```

**Example**:
```js
RequestHelper.timeToExpireInMilliseconds = 10000;

RequestHelper.GET("https://movies.com/api/memes")
    .then((response) => {
        // Handle Response ...
    })
    .catch((e) => {
        // Handle Error ...
    });
```