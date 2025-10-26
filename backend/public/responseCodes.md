# Common and Important HTTP Response Codes

| Category | Code | Message | Description |
|-----------|-------|----------|--------------|
| **Informational (1xx)** | 100 | Continue | Request headers received; client can continue sending body. |
|  | 101 | Switching Protocols | Server agrees to change communication protocol. |
|  | 103 | Early Hints | Indicates resources to preload while final response is prepared. |
| **Successful (2xx)** | 200 | OK | Request succeeded; response depends on request type. |
|  | 201 | Created | A new resource has been successfully created. |
|  | 202 | Accepted | Request accepted for processing but not yet completed. |
|  | 203 | Non-Authoritative Information | Returned metadata differs from the origin server. |
|  | 204 | No Content | Request succeeded, but no content is returned. |
| **Redirection (3xx)** | 301 | Moved Permanently | Resource has permanently moved to a new URL. |
|  | 302 | Found | Resource temporarily available at a different URI. |
|  | 304 | Not Modified | Indicates cached version is still valid. |
|  | 307 | Temporary Redirect | Same as 302 but retains HTTP method. |
|  | 308 | Permanent Redirect | Same as 301 but keeps original request method. |
| **Client Error (4xx)** | 400 | Bad Request | Request could not be understood by the server. |
|  | 401 | Unauthorized | Authentication is required or has failed. |
|  | 403 | Forbidden | Client is not permitted to access the resource. |
|  | 404 | Not Found | Requested resource doesn't exist on the server. |
|  | 405 | Method Not Allowed | HTTP method not supported for this resource. |
|  | 408 | Request Timeout | Server timed out waiting for the client request. |
|  | 409 | Conflict | Conflict between the request and current resource state. |
|  | 429 | Too Many Requests | Client has sent too many requests in a given time period. |
| **Server Error (5xx)** | 500 | Internal Server Error | Generic server-side error. |
|  | 501 | Not Implemented | Server doesn’t support the functionality required. |
|  | 502 | Bad Gateway | Server received invalid response from upstream server. |
|  | 503 | Service Unavailable | Server is overloaded or temporarily offline. |
|  | 504 | Gateway Timeout | Gateway or proxy server didn’t get a timely response. |
| **Nonstandard/Common Extensions** | 418 | I’m a Teapot | RFC joke status code for “brew coffee” request. |
|  | 520 | Unknown Error | Cloudflare-specific generic server error. |
|  | 521 | Web Server Is Down | Origin refused connection (Cloudflare). |