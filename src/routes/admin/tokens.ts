import { loadTokensList } from 'store/actions';
import { Store, dispatchify } from 'aurelia-store';
import { autoinject } from 'aurelia-framework';
import { State } from 'store/state';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app';

import styles from './tokens.module.css';

@autoinject()
export class AdminTokens {
    private styles = styles;

    private state: State;
    private subscription: Subscription;

    private settings;

    constructor(private store: Store<State>) {

    }

    bind() {
        this.subscription = this.store.state.subscribe((state: State) => {
            this.state = state;
        });
    }

    unbind() {
        this.subscription.unsubscribe();
    }

    async activate() {
        await dispatchify(loadTokensList)();

        const settings = await firebase.firestore().collection('admin').doc('settings').get();

        if (settings.exists) {
            this.settings = settings.data();
        }
    }

    async updateSettings() {
        const settings = await firebase.firestore().collection('admin').doc('settings');

        this.settings.updatedBy = firebase.auth().currentUser.uid;

        settings.update(this.settings);
    }
}
