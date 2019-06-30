import { Router } from 'aurelia-router';
import { ToastMessage } from './../services/toast-service';
import { I18N } from 'aurelia-i18n';
import { Store, dispatchify } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { State } from 'store/state';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from 'environment';
import { ToastService } from 'services/toast-service';
import { login } from 'store/actions';
import { SteemKeychain } from 'services/steem-keychain';

@autoinject()
export class SigninModal {
    private environment = environment;
    private subscription: Subscription;
    private user: State['account'];
    private loading = false;
    private useActiveKey = false;
    private username;
    private privateKey;

    constructor(private controller: DialogController, private se: SteemEngine, private keychain: SteemKeychain, private store: Store<State>, 
        private i18n: I18N, private router: Router, private toast: ToastService) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    bind() {
        this.subscription = this.store.state.pipe(pluck('account')).subscribe((user: State['account']) => {
            this.user = user;
        });
    }

    unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    async keychainSignIn() {
        const account = await this.se.login(this.username.trim().toLowerCase());

        if (account) {
            const toast = new ToastMessage();
    
            toast.message = this.i18n.tr('notifications:signinSuccess');

            toast.overrideOptions.onClosing = () => {
                this.controller.close(true);
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
                this.controller.close(true);
                this.router.navigateToRoute('home');
            }

            this.toast.success(toast);

            await dispatchify(login)(account);
        }
    }
}
