import firebase from 'firebase/app';

import styles from './users.module.css';

export class AdminUsers {
    private styles = styles;

    private users = [];

    async activate() {
        const users = await firebase.firestore().collection('users')
            .get();

        if (users.docs) {
            this.users = users.docs.map(doc => ({id: doc.id, ...doc.data()}));
        }
    }
}
