import { autoinject, newInstance } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { environment } from 'environment';

const http = new HttpClient();

@autoinject()
export class AuthService {
    constructor() {
        http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl(environment.FIREBASE_API)
        });
    }

    async getUserAuthMemo(username: string) {
        const res = await http.fetch(`getUserAuthMemo/${username}/`);
        const obj = await res.json();

        return obj.memo;
    }

    async verifyUserAuthMemo(username, signedKey) {
        const res = await http.fetch('verifyUserAuthMemo/', {
            method: 'POST',
            body: json({
                username,
                signedKey
            })
        });

        const obj = await res.json();

        return obj.token;
    }
}
