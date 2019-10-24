import { Subscription } from 'rxjs';
import { State } from 'store/state';
import { loadTokensList, getCurrentFirebaseUser } from 'store/actions';
import firebase from 'firebase/app';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';
import { dispatchify, Store } from 'aurelia-store';

import styles from './settings.module.css';

@autoinject()
export class Settings {
    private state: State;
    private selectedTab = 'favorites';
    private user;
    private subscription: Subscription;
    private styles = styles;

    constructor(private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue) {

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
        await dispatchify(getCurrentFirebaseUser)();
    }

    tabChanged(tab: string) {
        this.selectedTab = tab;
    }

    updateData() {
        this.taskQueue.queueTask(() => {
            const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

            userRef.set(this.state.firebaseUser, {
                merge: true
            });
        });
    }
}
