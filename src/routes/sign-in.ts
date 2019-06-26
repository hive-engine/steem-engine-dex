import { I18N } from 'aurelia-i18n';
import { ToastMessage } from './../services/toast-service';
import { login } from 'store/actions';
import { dispatchify } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { ToastService } from 'services/toast-service';
import { Router } from 'aurelia-router';

import styles from './sign-in.module.css';
import { SteemKeychain } from 'services/steem-keychain';

@autoinject()
export class Signin {
    private username;
    private privateKey;
    private styles = styles;

    constructor(
        private router: Router,
        private keychain: SteemKeychain,
        private se: SteemEngine, 
        private i18n: I18N, 
        private toast: ToastService) {
    }

    async keychainSignIn() {
        const account = await this.se.login(this.username.trim().toLowerCase());

        if (account) {
            const toast = new ToastMessage();
    
            toast.message = this.i18n.tr('notifications:signinSuccess');

            toast.overrideOptions.onClosing = () => {
                this.router.navigateToRoute('home');
            }

            this.toast.success(toast);

            await dispatchify(login)(account);
        }
    }

    async keySignIn() {
        const account = await this.se.login(this.username.trim().toLowerCase(), this.privateKey.trim());
        
        if (account) {
            const toast = new ToastMessage();
    
            toast.message = this.i18n.tr('notifications:signinSuccess');

            toast.overrideOptions.onClosing = () => {
                this.router.navigateToRoute('home');
            }

            this.toast.success(toast);

            await dispatchify(login)(account);
        }
    }
}
