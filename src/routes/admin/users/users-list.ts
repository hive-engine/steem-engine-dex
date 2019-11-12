import firebase from 'firebase/app';

export class UsersList {
    private users = [];

    async activate() {
        const users = await firebase.firestore().collection('users')
            .get();

        if (users.docs) {
            this.users = users.docs.map(doc => ({id: doc.id, ...doc.data()}));
        }
    }
}
