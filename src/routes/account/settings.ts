import { BootstrapFormRenderer } from './../../resources/bootstrap-form-renderer';
import { ValidationControllerFactory, ValidationController, ValidationRules } from 'aurelia-validation';
import { UploadType, FirebaseService } from './../../services/firebase-service';
import { Subscription } from 'rxjs';
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
    private document1Uploading = false;
    private document2Uploading = false;

    private renderer: BootstrapFormRenderer;
    private validationController: ValidationController;

    private selfieFileInput: HTMLInputElement;
    private passportFileInput: HTMLInputElement;
    private document1FileInput: HTMLInputElement;
    private document2FileInput: HTMLInputElement;
    private selfieImageFile: FileList;
    private passportImageFile: FileList;
    private document1ImageFile: FileList;
    private document2ImageFile: FileList;
    private passportImage;
    private selfieImage;
    private document1Image;
    private document2Image;
    private passportImageIsImage = false;
    private selfieImageIsImage = false;
    private document1ImageIsImage = false;
    private document2ImageIsImage = false;

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
            this.passportImageIsImage = !this.passportImage.includes('.pdf');
        }

        // eslint-disable-next-line no-undef
        if (this.user?.selfie?.filename) {
            this.selfieImage = await userUploads.child(`${this.state.account.name}/${this.user.selfie.filename}`).getDownloadURL();
            this.selfieImageIsImage = !this.selfieImage.includes('.pdf');
        }

        if (this.user?.document1?.filename) {
            this.document1Image = await userUploads.child(`${this.state.account.name}/${this.user.document1.filename}`).getDownloadURL();
            this.document1ImageIsImage = !this.document1Image.includes('.pdf');
        }

        if (this.user?.document2?.filename) {
            this.document2Image = await userUploads.child(`${this.state.account.name}/${this.user.document2.filename}`).getDownloadURL();
            this.document2ImageIsImage = !this.document2Image.includes('.pdf');
        }

        $(document).ready(() => {
            // @ts-ignore
            $('input, textarea').tooltip();
        });
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

    handleDocument1Drop(e) {
        e.preventDefault();
        e.stopPropagation();

        const dt = e.dataTransfer;
        const files: FileList = dt.files;

        if (files.length) {
            this.uploadDocument(files[0], 'document1');
        }
    }

    handleDocument2Drop(e) {
        e.preventDefault();
        e.stopPropagation();

        const dt = e.dataTransfer;
        const files: FileList = dt.files;

        if (files.length) {
            this.uploadDocument(files[0], 'document2');
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

    document1Changed() {
        if (this.document1ImageFile?.[0]) {
            this.uploadDocument(this.document1ImageFile[0], 'document1');

            this.document1FileInput.value = '';
        }
    }

    document2Changed() {
        if (this.document2ImageFile?.[0]) {
            this.uploadDocument(this.document1ImageFile[0], 'document2');

            this.document2FileInput.value = '';
        }
    }

    async uploadDocument(file: File, type: UploadType) {
        try {
            if (type === 'selfie') {
                this.selfieUploading = true;
            } else if (type === 'passport') {
                this.passportUploading = true;
            } else if (type === 'document1') {
                this.document1Uploading = true;
            } else if (type === 'document2') {
                this.document2Uploading = true;
            }

            await this.firebase.uploadDocument(file, type);

            this.selfieUploading = false;
            this.passportUploading = false;
            this.document1Uploading = false;
            this.document2Uploading = false;

            window.location.reload();
        } catch (e) {
            this.selfieUploading = false;
            this.passportUploading = false;
            this.document1Uploading = false;
            this.document2Uploading = false;
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
    @computedFrom('state.firebaseUser')
    get canUploadResidencyDocuments() {
        const user = this.state.firebaseUser;

        return true;
    }

    @computedFrom('state')
    get selfieVerified() {
        if (this.state) {
            return this.state.firebaseUser.kyc.selfieVerified;
        }

        return false;
    }

    @computedFrom('state')
    get document1Verified() {
        if (this.state) {
            return this.state.firebaseUser.residency.document1Verified;
        }

        return false;
    }

    @computedFrom('state')
    get document2Verified() {
        if (this.state) {
            return this.state.firebaseUser.residency.document2Verified;
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

    @computedFrom('state')
    get document1Pending() {
        if (this.state) {
            return this.state.firebaseUser.residency.document1Pending;
        }

        return false;
    }

    @computedFrom('state')
    get document2Pending() {
        if (this.state) {
            return this.state.firebaseUser.residency.document2Pending;
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

    @computedFrom('document1Pending', 'document1Pending')
    get document1StatusText() {
        if (!this.document1Pending) {
            return this.document1Verified ? 'verified' : 'unverified';
        } else {
            return 'pending';
        }
    }

    @computedFrom('document2Pending', 'document2Pending')
    get document2StatusText() {
        if (!this.document2Pending) {
            return this.document2Verified ? 'verified' : 'unverified';
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

            userRef.update(this.state.firebaseUser);
        });
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('email').email()
        .rules;

        this.validationController.addObject(this.user, rules);
    }
}
