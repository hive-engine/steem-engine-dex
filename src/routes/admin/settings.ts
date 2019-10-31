import firebase from 'firebase/app';

export class AdminSettings {
    private settings;

    async activate() {
        const settings = await firebase.firestore().collection('admin').doc('settings').get();

        if (settings.exists) {
            this.settings = settings.data();
        }
    }
}
