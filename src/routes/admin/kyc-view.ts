import { Redirect, RouteConfig } from 'aurelia-router';

import firebase from 'firebase/app';

export class AdminKycView {
    private user;

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
}
