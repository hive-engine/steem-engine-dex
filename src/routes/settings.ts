import { SteemEngine } from './../services/steem-engine';
import firebase from 'firebase/app';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class Settings {
    private user = null;
    private tokens = [];
    private selectedTab = 'favorites';

    constructor(private se: SteemEngine) {

    }

    async activate() {
        try {
            this.tokens = await this.se.loadTokens() as any;

            console.log(this.tokens);

            const doc = await firebase.firestore().collection('users').doc(this.se.getUser()).get();

            if (doc.exists) {
                this.user = doc.data();
            }
    
            console.log(this.user);
        } catch (e) {
            console.error(e);
        }
    }

    tabChanged(tab: string) {
        this.selectedTab = tab;
    }
}
