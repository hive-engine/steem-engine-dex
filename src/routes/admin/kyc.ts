import firebase from 'firebase/app';

import styles from './kyc.module.css';

export class AdminKyc {
    private styles = styles;

    private kycItems = [];

    async activate() {
        const pendingKycUsers = await firebase.firestore().collection('users')
            .where('kyc.passportPending', '==', true)
            .where('kyc.selfiePending', '==', true)
            .get();

        console.log(pendingKycUsers);

        if (pendingKycUsers.docs) {
            this.kycItems = pendingKycUsers.docs.map(doc => ({id: doc.id, ...doc.data()}));
        }
    }
}
