import RequestResponseType from "./RequestResponseType";
declare class RequestHelper {
    private static _requests;
    private static _events;
    private static _cache;
    static timeToExpireInMilliseconds: number;
    static GET(url: string, fetchOptions?: object, forceRequest?: boolean, responseType?: RequestResponseType): Promise<any>;
    private static HandlePromise;
    private static AddEvent;
    private static GetExpired;
}
export default RequestHelper;
//# sourceMappingURL=RequestHelper.d.ts.map