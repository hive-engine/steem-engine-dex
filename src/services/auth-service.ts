import { autoinject, newInstance } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { environment } from 'environment';
import firebase from 'firebase/app';

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

    async getIdToken() {
        return firebase.auth().currentUser.getIdToken();
    }

    async getUserAuthMemo(username: string): Promise<unknown> {
        const res = await http.fetch(`getUserAuthMemo/${username}/`);
        const obj = await res.json();

        return obj.memo;
    }

    async verifyUserAuthMemo(username, signedKey): Promise<unknown> {
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
