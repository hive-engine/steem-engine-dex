import { AuthService } from './auth-service';
import { autoinject } from 'aurelia-framework';
import { HttpClient, json } from 'aurelia-fetch-client';
import { environment } from 'environment';
import firebase from 'firebase/app';

const http = new HttpClient();

export type UploadType = 'passport' | 'selfie' | 'document1' | 'document2';

@autoinject()
export class FirebaseService {
    constructor(private auth: AuthService) {
        http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl(environment.FIREBASE_API)
                .withInterceptor({
                    request: async (request: Request): Promise<Request> => {
                        request.headers.append('authorization', await this.auth.getIdToken());

                        return request;
                    }
                })
        });
    }

    async uploadDocument(file: File, type: UploadType) {
        const formData = new FormData();

        formData.append('document', file);
        formData.append('type', type);

        const res = await http.fetch(`documents/upload`, {
            method: 'POST',
            body: formData,
            headers: new Headers()
        });

        const response = await res.json();

        return response;
    }

    async uploadNftImage(file: File) {
        const formData = new FormData();

        formData.append('image', file);

        const res = await http.fetch(`nfts/upload`, {
            method: 'POST',
            body: formData,
            headers: new Headers()
        });

        const response = await res.json();

        return response;
    }

    async getIdToken() {
        return firebase.auth().currentUser.getIdToken();
    }
}
