import { Redirect, RouteConfig } from 'aurelia-router';

import 'firebase/storage';
import firebase from 'firebase/app';

export class AdminKycView {
    private user;
    private passportImage;
    private selfieImage;

    async canActivate(params: { uid: string }, routeConfig: RouteConfig) {
        if (!params.uid) {
            return new Redirect('admin');
        }

        const user = await firebase.firestore().collection('users').doc(params.uid).get();

        if (user.exists) {
            this.user = { id: user.id, ...user.data() };

            routeConfig.navModel.setTitle(`KYC > ${this.user.id}`);

            console.info(`KYC View`, this.user);
        }
    }

    async activate() {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const userUploads = storageRef.child('user-uploads');

        // eslint-disable-next-line no-undef
        if (this.user?.passport?.filename) {
            this.passportImage = await userUploads.child(`${this.user.id}/${this.user.passport.filename}`).getDownloadURL();
        }

        // eslint-disable-next-line no-undef
        if (this.user?.selfie?.filename) {
            this.selfieImage = await userUploads.child(`${this.user.id}/${this.user.selfie.filename}`).getDownloadURL();
        }
    }
}
