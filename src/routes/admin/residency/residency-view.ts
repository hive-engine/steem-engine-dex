import { SteemEngine } from 'services/steem-engine';
import { computedFrom, autoinject } from 'aurelia-framework';
import { Redirect, RouteConfig, AppRouter } from 'aurelia-router';

import 'firebase/storage';
import firebase from 'firebase/app';

@autoinject()
export class AdminResidencyView {
    private user;

    private document1Image;
    private document2Image;

    private showDocument1Reject = false;
    private showDocument2Reject = false;

    constructor(private se: SteemEngine, private router: AppRouter) {

    }

    async canActivate(params: { uid: string }, routeConfig: RouteConfig) {
        if (!params.uid) {
            return new Redirect('admin');
        }

        const user = await firebase.firestore().collection('users').doc(params.uid).get();

        if (user.exists) {
            this.user = { id: user.id, ...user.data() };

            routeConfig.navModel.setTitle(`Residency > ${this.user.id}`);
        }
    }

    async activate() {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const userUploads = storageRef.child('user-uploads');

        // eslint-disable-next-line no-undef
        if (this.user?.document1?.filename) {
            this.document1Image = await userUploads.child(`${this.user.id}/${this.user.document1.filename}`).getDownloadURL();
        }

        // eslint-disable-next-line no-undef
        if (this.user?.document2?.filename) {
            this.document2Image = await userUploads.child(`${this.user.id}/${this.user.document2.filename}`).getDownloadURL();
        }
    }

    async rejectDocument1() {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const userUploads = storageRef.child('user-uploads');
        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        try {
            await userUploads.child(`${this.user.id}/${this.user.document1.filename}`).delete();

            delete this.user.document1;
            delete this.user.id;

            this.user.residency.document1Rejected = true;
            this.user.residency.document2Pending = false;

            await userRef.set(this.user);

            this.document1Image = null;
        } catch (e) {
            console.error(e);
        } finally {
            this.showDocument1Reject = false;
        }
    }

    async rejectDocument2() {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const userUploads = storageRef.child('user-uploads');
        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        try {
            await userUploads.child(`${this.user.id}/${this.user.document2.filename}`).delete();

            delete this.user.document2;
            delete this.user.id;
            this.user.residency.document2Rejected = true;
            this.user.residency.document2Pending = false;

            await userRef.set(this.user);

            this.document2Image = null;
        } catch (e) {
            console.error(e);
        } finally {
            this.showDocument2Reject = false;
        }
    }

    async approveResidency() {
        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        try {
            await userRef.set({ 
                residency: { 
                    passportPending: false, 
                    passportVerified: true, 
                    passportRejected: false,
                    passportRejectionReason: '',
                    selfiePending: false, 
                    selfieVerified: true, 
                    selfieRejected: false,
                    selfieRejectionReason: '',
                    verified: true 
                } 
            }, { merge: true });

            this.router.navigate('/admin/residency');
        } catch (e) {
            console.error(e);
        }
    }
}
