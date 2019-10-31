import firebase from 'firebase/app';

import styles from './settings.module.css';

export class AdminSettings {
    private styles = styles;

    private settings;

    private siteNameChanged = false;

    async activate() {
        const settings = await firebase.firestore().collection('admin').doc('settings').get();

        if (settings.exists) {
            this.settings = settings.data();
        }
    }

    fieldChanged(prop: string, value: string) {
        if (value.trim() !== '') {
            this[`${prop}Changed`] = true;
        } else {
            this[`${prop}Changed`] = false;
        }
    }

    async updateSettings(fieldName: string) {
        if (fieldName) {
            this.fieldChanged(fieldName, '');
        }

        const settings = await firebase.firestore().collection('admin').doc('settings');

        this.settings.updatedBy = firebase.auth().currentUser.uid;

        settings.update(this.settings);
    }
}
