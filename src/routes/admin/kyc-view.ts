import { Redirect } from 'aurelia-router';

import firebase from 'firebase/app';

export class AdminKycView {
    private user;

    async canActivate(params) {
        if (!params.uid) {
            return new Redirect('admin');
        }

        const user = await firebase.firestore().collection('users').doc(params.uid).get();

        if (user.exists) {
            this.user = { id: user.id, ...user.data() };

            console.log(this.user);
        }
    }
}
