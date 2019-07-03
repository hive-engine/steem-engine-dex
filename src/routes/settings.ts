import { SteemEngine } from './../services/steem-engine';
import firebase from 'firebase/app';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class Settings {
    private user = null;

    constructor(private se: SteemEngine) {

    }

    async activate() {
        console.log(this.se.getUser());
        const doc = await firebase.firestore().collection('users').doc(this.se.getUser()).get();

        if (doc.exists) {
            this.user = doc.data();
        }

        console.log(this.user);
    }
}
