import RequestCacheData from "./RequestCacheData";

interface RequestCache {
    [url: string]: RequestCacheData;
}

export default RequestCache;