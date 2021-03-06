import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Utilities, StorageHelper, UxUtil} from '../helpers';

@Injectable()
export class RequestHelper {
    constructor(private _http: Http) { }

    get<T>(url: string, unformatted?: boolean) {
        let xhr = this._http.get(url);
        return unformatted ? this._text(xhr) : this._json<T>(xhr);
    }

    post<T>(url: string, body: any, options?: RequestOptions) {
        let requestOptions = options || RequestHelper.generateHeaders({ "Content-Type": "application/json" });
        let xhr = Utilities.isNull(requestOptions) ? this._http.post(url, JSON.stringify(body)) : this._http.post(url, JSON.stringify(body), requestOptions);
        return this._json<T>(xhr);
    }

    put<T>(url: string, body: any, options?: RequestOptions) {
        let requestOptions = options || RequestHelper.generateHeaders();
        let xhr = this._http.put(url, body, requestOptions);
        return xhr.toPromise();
    }

    static generateHeaders(additionalHeaders?: { [key: string]: any }): RequestOptions {
        var headersObj = additionalHeaders || {};
        headersObj["Accept"] = "application/json";

        var headers = new Headers(headersObj);
        return new RequestOptions({ headers: headers });
    }

    private _text(request: Observable<any>): Promise<string> {
        return request
            .map(response => response.text() as string)
            .toPromise();
    }

    private _json<T>(request: Observable<any>): Promise<T> {
        return request
            .map(response => response.json() as T)
            .toPromise();
    }
}