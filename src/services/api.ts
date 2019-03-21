import { HttpClient } from 'aurelia-fetch-client';
import { lazy } from 'aurelia-framework';

import queryString from 'query-string';

import environment from 'environment';

export class Api {
    private http: HttpClient;

    constructor(@lazy(HttpClient) private getHttpClient: () => HttpClient) {
        this.http = this.getHttpClient();

        this.http.configure(config => {
            config
              .useStandardConfiguration()
              .withBaseUrl(environment.ACCOUNTS_API_URL);
          });
    }
    
    async getHistory(account: string, limit = 100, offset = 0, type = 'user', symbol: string) {
        return this.http.fetch(`/history?${queryString.stringify({
            account,
            limit,
            offset,
            type,
            symbol
        })}`);
    }
}
