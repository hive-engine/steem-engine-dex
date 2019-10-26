import { UploadType, FirebaseService } from './../services/firebase-service';
import { Subscription } from 'rxjs';
import { State } from 'store/state';
import { loadTokensList, getCurrentFirebaseUser } from 'store/actions';
import firebase from 'firebase/app';
import { autoinject, TaskQueue, computedFrom } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';
import { dispatchify, Store } from 'aurelia-store';
import { faCheckCircle, faImagePolaroid, faPassport } from '@fortawesome/pro-duotone-svg-icons';

import styles from './settings.module.css';

@autoinject()
export class Settings {
    private state: State;
    private selectedTab = 'profile';
    private user;
    private subscription: Subscription;
    private styles = styles;

    private editMode = false;

    private polaroidIcon = faImagePolaroid;
    private passportIcon = faPassport;
    private checkIcon = faCheckCircle;

    constructor(private se: SteemEngine, private firebase: FirebaseService, private store: Store<State>, private taskQueue: TaskQueue) {

    }

    bind() {
        this.subscription = this.store.state.subscribe((state: State) => {
            this.state = state;

            if (this.state.firebaseUser.tabPreference) {
                this.selectedTab = this.state.firebaseUser.tabPreference;
            }
            
            this.user = { ...this.state.firebaseUser };
        });
    }

    unbind() {
        this.subscription.unsubscribe();
    }

    async activate() {
        await dispatchify(loadTokensList)();
        await dispatchify(getCurrentFirebaseUser)();
    }

    private resetUser() {
        this.user = { ...this.state.firebaseUser };
        this.editMode = false;
    }

    private saveProfile() {
        this.state.firebaseUser = { ...this.state.firebaseUser, ...this.user };
        this.editMode = false;

        this.updateData();
    }

    handleEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleSelfieDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        let dt = e.dataTransfer;
        let files: FileList = dt.files;

        if (files.length) {
            this.uploadDocument(files[0], 'selfie');
        }
    }

    async uploadDocument(file: File, type: UploadType) {
        const upload = this.firebase.uploadKycFile(file, type);
    }

    @computedFrom('state')
    get selfieVerified() {
        if (this.state) {
            return this.state.firebaseUser.kyc.selfieVerified;
        }

        return false;
    }

    @computedFrom('state')
    get passportVerified() {
        if (this.state) {
            return this.state.firebaseUser.kyc.passportVerified;
        }

        return false;
    }

    @computedFrom('state')
    get selfiePending() {
        if (this.state) {
            return this.state.firebaseUser.kyc.selfiePending;
        }

        return false;
    }

    @computedFrom('state')
    get passportPending() {
        if (this.state) {
            return this.state.firebaseUser.kyc.passportPending;
        }

        return false;
    }

    @computedFrom('selfiePending', 'selfieVerified')
    get selfieStatusText() {
        if (!this.selfiePending) {
            return this.selfieVerified ? 'verified' : 'unverified';
        } else {
            return 'pending';
        }
    }

    @computedFrom('passportPending', 'passportPending')
    get passportStatusText() {
        if (!this.passportPending) {
            return this.passportVerified ? 'verified' : 'unverified';
        } else {
            return 'pending';
        }
    }

    tabChanged(tab: string) {
        this.selectedTab = tab;

        this.state.firebaseUser.tabPreference = tab;

        this.updateData();
    }

    updateData() {
        this.taskQueue.queueTask(() => {
            const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

            console.log(this.state.firebaseUser);

            userRef.set(this.state.firebaseUser, {
                merge: true
            });
        });
    }
}
