import { nativeXHR } from '../helpers/nativeServices';
import { extendWithBind } from '../helpers/util';

//TODO: Should this function capitalize each header name? 'content-type' --> 'Content-Type'
const createAllFakeHeaders = (headers) => {
  const fakeHeaders = Object.keys(headers).map(k => `${k}: ${headers[k]}`);

  fakeHeaders.push(''); // This element in the array is important because generates a valid response headers

  return fakeHeaders.join('\n');
};

const fakeHeaders = {
  'content-type': 'application/json; charset=utf-8'
}
const allFakeHeaders = createAllFakeHeaders(fakeHeaders);

export const name = 'XMLHttpRequest';
export const Reference = nativeXHR;
export const fakeService = helpers => class XMLHttpRequestInterceptor {
  constructor() {
    this.xhr = new nativeXHR();
    this.getHandler = helpers.getHandler;
    this.getParams = helpers.getParams;
    this._requestHeaders = {};

    extendWithBind(this, this.xhr);
  }

  //TODO: Handle 'async', 'user', 'password'
  open(method, url, async, user, password) {
    this.method = method;
    this.url = url;
    this.xhr.open(method, url);
  }

  //TODO: Handle 'data' parameter
  //TODO: Support all handlers 'progress', 'loadstart', 'abort', 'error'
  send(data) {
    const handler = this.getHandler(this.url, this.method);
    const xhr = this.xhr;
    const onreadyCallback = this.onreadystatechange;
    const onloadCallback = this.onload;
    const successCallback = onreadyCallback || onloadCallback;

    //Intercept: Fire fake handler
    if (handler && successCallback) {
      const params = this.getParams(this.url, this.method);
      const query = helpers.getQuery(this.url);
      const headers = this._requestHeaders;
      //TODO: Pass 'body' to handler
      const response = JSON.stringify(handler({params, query, headers}));

      this.readyState = 4;
      this.status = 200; // @TODO (zzarcon): Support custom status codes

      //TODO: should 'this.response' be the response string or the response json?
      this.responseText = this.response = response;

      return successCallback();
    }

    //Passthrough: Fire normal handler
    //TODO: Automatically set all the properties
    xhr.onreadystatechange = () => {
      this.readyState = xhr.readyState;
      this.response = xhr.response;
      this.responseText = xhr.responseText;
      this.responseType = xhr.responseType;
      this.responseXML = xhr.responseXML;
      this.status = xhr.status;
      this.statusText = xhr.statusText;

      return onreadyCallback && onreadyCallback.call(xhr);
    };

    xhr.onload = () => {
      onloadCallback && onloadCallback.call(xhr);
    };

    return xhr.send();
  }

  setRequestHeader(name, value) {
    this._requestHeaders[name] = value;

    this.xhr.setRequestHeader(name, value);
  }

  getResponseHeader(name) {
    const header = this.xhr.getResponseHeader(name) || fakeHeaders[name];
    return header;
  }

  getAllResponseHeaders() {
    const headers = this.xhr.getAllResponseHeaders() || allFakeHeaders;
    return headers;
  }
};
