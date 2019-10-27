import firebase from 'firebase/app';

export class AdminKyc {
    private kycItems = [];

    async activate() {
        const passportPendingUsers = await firebase.firestore().collection('users').where('passportPending', '==', true).get();
        const selfiePendingUsers = await firebase.firestore().collection('users').where('selfiePending', '==', true).get();

        console.log(passportPendingUsers, selfiePendingUsers);
    }
}
