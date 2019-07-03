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
                .withInterceptor({
                    request(message) {
                        let token = localStorage.getItem('se_access_token') || null;

                        message.headers.set('Authorization', `Bearer ${token}`);
                        
                        return message;
                    }
                })
        });
    }

    async getUserAuthMemo(username: string) {
        console.log(http.defaults);
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
