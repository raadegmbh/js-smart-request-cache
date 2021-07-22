import RequestResponseType from "./RequestResponseType";

interface RequestCacheData {
    created: Date,
    data: any,
    type: RequestResponseType,
}

export default RequestCacheData;