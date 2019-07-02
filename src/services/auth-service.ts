import { autoinject, newInstance } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { environment } from 'environment';

console.log(environment.NODE_API_URL);

const http = new HttpClient();

@autoinject()
export class AuthService {
    constructor() {
        http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl(environment.NODE_API_URL)
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
        const res = await http.fetch(`getUserAuthMemo/${username}`);
        const obj = await res.json();

        return obj.memo;
    }

    async verifyUserAuthMemo(username, signedKey) {
        const res = await http.fetch('verifyUserAuthMemo', {
            method: 'POST',
            body: json({
                username,
                signedKey
            })
        });

        const obj = await res.json();

        return {
            accessToken: obj.access_token,
            refreshToken: obj.refresh_token
        };
    }

    async verifyAuthToken(username, accessToken) {
        const res = await http.fetch('verifyAuthToken', {
            method: 'POST',
            body: json({
                username,
                accessToken
            })
        });

        const obj = await res.json();

        return obj;
    }

    async newAuthToken(username, refreshToken) {
        const res = await http.fetch('newAuthToken', {
            method: 'POST',
            body: json({
                username,
                refreshToken
            })
        });

        const obj = await res.json();

        return obj.access_token;
    }

    /**
     * Get the KYC status for a logged in user
     * 
     * @param username 
     */
    async kycStatus(username: string) {
        const res = await http.fetch('kyc/status', {
            method: 'POST',
            body: json({
                username
            })
        });

        return await res.json();
    }

    /**
     * Upload KYC data to the server for a specific user
     * 
     * @param username 
     * @param body 
     */
    async kycUpload(username: string, body: any) {
        const res = await http.fetch('kyc/submit', {
            method: 'POST',
            body: json({
                username,
                ...body
            })
        });

        return await res.json();
    }

    /**
     * Update KYC data to the server for a specific user
     * 
     * @param username 
     * @param body 
     */
    async kycUpdate(username: string, body: any) {
        const res = await http.fetch('kyc/save', {
            method: 'POST',
            body: json({
                username,
                ...body
            })
        });

        return await res.json();
    }
}
