import { SteemEngine } from 'services/steem-engine';
import { computedFrom, autoinject } from 'aurelia-framework';
import { Redirect, RouteConfig, AppRouter } from 'aurelia-router';

import 'firebase/storage';
import firebase from 'firebase/app';

@autoinject()
export class AdminKycView {
    private user;

    private passportImage;
    private selfieImage;

    private approve = {
        code: false,
        selfieQuality: false,
        selfieDate: false,
        passportDate: false,
        passportDetails: false
    };

    private showPassportReject = false;
    private showSelfieReject = false;

    constructor(private se: SteemEngine, private router: AppRouter) {

    }

    async canActivate(params: { uid: string }, routeConfig: RouteConfig) {
        if (!params.uid) {
            return new Redirect('admin');
        }

        const user = await firebase.firestore().collection('users').doc(params.uid).get();

        if (user.exists) {
            this.user = { id: user.id, ...user.data() };

            routeConfig.navModel.setTitle(`KYC > ${this.user.id}`);
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

    async rejectSelfie() {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const userUploads = storageRef.child('user-uploads');
        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        try {
            await userUploads.child(`${this.user.id}/${this.user.selfie.filename}`).delete();

            this.user.selfie = undefined;
            this.user.kyc.selfieRejected = true;
            this.user.kyc.selfiePending = false;

            await userRef.set({kyc: this.user.kyc}, { merge: true });

            this.selfieImage = null;
        } catch (e) {
            console.error(e);
        } finally {
            this.showSelfieReject = false;
        }
    }

    async rejectPassport() {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const userUploads = storageRef.child('user-uploads');
        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        try {
            await userUploads.child(`${this.user.id}/${this.user.passport.filename}`).delete();

            this.user.passport = undefined;
            this.user.kyc.passportRejected = true;
            this.user.kyc.passportPending = false;

            await userRef.set({kyc: this.user.kyc}, { merge: true });

            this.passportImage = null;
        } catch (e) {
            console.error(e);
        } finally {
            this.showPassportReject = false;
        }
    }

    @computedFrom('approve.code', 'approve.selfieQuality', 'approve.selfieDate', 'approve.passportDate', 'approve.passportDetails')
    get canApprove() {
        return Object.keys(this.approve).every(prop => this.approve[prop]);
    }

    async approveKyc() {
        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        try {
            await userRef.set({ 
                kyc: { 
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

            this.router.navigate('/admin/kyc');
        } catch (e) {
            console.error(e);
        }
    }
}
