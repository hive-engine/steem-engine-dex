import { State } from './../store/state';
import { loadTokensList, getCurrentFirebaseUser } from 'store/actions';
import firebase from 'firebase/app';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { SteemEngine } from './../services/steem-engine';
import { dispatchify, connectTo } from 'aurelia-store';

@autoinject()
@connectTo()
export class Settings {
    private state: State;
    private selectedTab = 'favorites';

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {

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
