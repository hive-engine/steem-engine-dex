import styles from './kyc.module.css';

import firebase from 'firebase/app';

export class AdminKycQueue {
    private styles = styles;

    private kycItems = [];

    async activate() {
        const passportPendingUsers = await firebase.firestore().collection('users')
            .where('kyc.passportPending', '==', true)
            .get();

        const selfiePendingUsers = await firebase.firestore().collection('users')
            .where('kyc.selfiePending', '==', true)
            .get();

        if (passportPendingUsers.docs || selfiePendingUsers.docs) {
            const passportPending = passportPendingUsers.docs.map(doc => ({id: doc.id, ...doc.data()}));
            const selfiePending = selfiePendingUsers.docs.map(doc => ({id: doc.id, ...doc.data()}));
            this.kycItems = [...passportPending, ...selfiePending];
        }
    }
}
