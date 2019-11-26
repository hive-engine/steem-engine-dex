import { BootstrapFormRenderer } from './../../resources/bootstrap-form-renderer';
import { ValidationControllerFactory, ValidationController, ValidationRules } from 'aurelia-validation';
import { UploadType, FirebaseService } from './../../services/firebase-service';
import { Subscription } from 'rxjs';
import { State } from 'store/state';
import { loadTokensList, getCurrentFirebaseUser } from 'store/actions';
import { autoinject, TaskQueue, computedFrom } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';
import { dispatchify, Store } from 'aurelia-store';
import { faCheckCircle, faImagePolaroid, faPassport } from '@fortawesome/pro-duotone-svg-icons';

import countries from 'common/data/countries.json';

import styles from './settings.module.css';

import 'firebase/storage';
import firebase from 'firebase/app';

@autoinject()
export class Settings {
    private state: State;
    private selectedTab = 'profile';
    private user;
    private subscription: Subscription;
    private styles = styles;

    private countries = countries;

    private editMode = false;

    private polaroidIcon = faImagePolaroid;
    private passportIcon = faPassport;
    private checkIcon = faCheckCircle;

    private selfieUploading = false;
    private passportUploading = false;

    private renderer: BootstrapFormRenderer;
    private validationController: ValidationController;

    private selfieFileInput: HTMLInputElement;
    private passportFileInput: HTMLInputElement;
    private selfieImageFile: FileList;
    private passportImageFile: FileList;
    private passportImage;
    private selfieImage;

    constructor(private se: SteemEngine, private controllerFactory: ValidationControllerFactory, private firebase: FirebaseService, private store: Store<State>, private taskQueue: TaskQueue) {
        this.validationController = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);
    }

    bind() {
        this.subscription = this.store.state.subscribe((state: State) => {
            this.state = state;

            if (this.state.firebaseUser.tabPreference) {
                this.selectedTab = this.state.firebaseUser.tabPreference;
            }
            
            this.user = { ...this.state.firebaseUser };

            this.createValidationRules();
        });
    }

    unbind() {
        this.subscription.unsubscribe();
    }

    async activate() {
        dispatchify(loadTokensList)();
        await dispatchify(getCurrentFirebaseUser)();
    }

    async attached() {
        const storage = firebase.storage();
        const storageRef = storage.ref();
        const userUploads = storageRef.child('user-uploads');

        // eslint-disable-next-line no-undef
        if (this.user?.passport?.filename) {
            this.passportImage = await userUploads.child(`${this.state.account.name}/${this.user.passport.filename}`).getDownloadURL();
        }

        // eslint-disable-next-line no-undef
        if (this.user?.selfie?.filename) {
            this.selfieImage = await userUploads.child(`${this.state.account.name}/${this.user.selfie.filename}`).getDownloadURL();
        }
    }

    enableEditMode() {
        this.editMode = true;

        this.resetValidationStyles();
    }

    resetValidationStyles() {
        for (const el of Array.from(document.getElementsByClassName('is-valid'))) {
            el.classList.remove('is-valid');
        }

        for (const el of Array.from(document.getElementsByClassName('is-invalid'))) {
            el.classList.remove('is-invalid');
        }
    }

    private resetUser() {
        this.user = { ...this.state.firebaseUser };
        this.editMode = false;

        this.resetValidationStyles();
    }

    private async saveProfile() {
        this.state.firebaseUser = { ...this.state.firebaseUser, ...this.user };
        this.editMode = false;

        const validate = await this.validationController.validate();

        if (validate.valid) {
            this.updateData();

            this.resetValidationStyles();
        }
    }

    handleEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleSelfieDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const dt = e.dataTransfer;
        const files: FileList = dt.files;

        if (files.length) {
            this.uploadDocument(files[0], 'selfie');
        }
    }

    handlePassportDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const dt = e.dataTransfer;
        const files: FileList = dt.files;

        if (files.length) {
            this.uploadDocument(files[0], 'passport');
        }
    }

    selfieChanged() {
        if (this.selfieImageFile?.[0]) {
            this.uploadDocument(this.selfieImageFile[0], 'selfie');

            this.selfieFileInput.value = '';
        }
    }

    passportChanged() {
        if (this.passportImageFile?.[0]) {
            this.uploadDocument(this.passportImageFile[0], 'passport');

            this.passportFileInput.value = '';
        }
    }

    async uploadDocument(file: File, type: UploadType) {
        try {
            if (type === 'selfie') {
                this.selfieUploading = true;
            } else {
                this.passportUploading = true;
            }

            await this.firebase.uploadKycFile(file, type);

            this.selfieUploading = false;
            this.passportUploading = false;

            window.location.reload();
        } catch (e) {
            this.selfieUploading = false;
            this.passportUploading = false;
        }
    }

    @computedFrom('state.firebaseUser')
    get canUploadKycDocuments() {
        const user = this.state.firebaseUser;

        return user.firstName.trim() !== '' 
            && user.lastName.trim() !== '' 
            && user.email.trim() !== '' 
            && user.country.trim() !== ''
            && user.addressLine1.trim() !== ''
            && user.state.trim() !== '';
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

            userRef.set(this.state.firebaseUser, {
                merge: true
            });
        });
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('email').email()
        .rules;

        this.validationController.addObject(this.user, rules);
    }
}
