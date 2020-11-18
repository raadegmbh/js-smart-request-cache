import RequestPromise from "./RequestEvent";

interface RequestWaitEvent {
    [url: string]: Array<RequestPromise>;
}

export default RequestWaitEvent;