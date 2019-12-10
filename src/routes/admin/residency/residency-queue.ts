import styles from './residency.module.css';

import firebase from 'firebase/app';

import uniqBy from 'lodash/uniqBy';

export class AdminResidencyQueue {
    private styles = styles;

    private residencyItems = [];

    async activate() {
        const document1PendingUsers = await firebase.firestore().collection('users')
            .where('residency.document1Pending', '==', true)
            .get();

        const document2PendingUsers = await firebase.firestore().collection('users')
            .where('residency.document2Pending', '==', true)
            .get();

        if (document1PendingUsers.docs || document2PendingUsers.docs) {
            const document1Pending = document1PendingUsers.docs.map(doc => ({id: doc.id, ...doc.data()}));
            const document2Pending = document2PendingUsers.docs.map(doc => ({id: doc.id, ...doc.data()}));
            const itemsArray = [...document1Pending, ...document2Pending];

            this.residencyItems = uniqBy(itemsArray, 'id');
        }
    }
}
