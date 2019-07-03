import { SteemEngine } from './../../services/steem-engine';
import { SigninModal } from './../../modals/signin';
import { DialogService } from 'aurelia-dialog';
import { customElement, bindable } from 'aurelia-framework';
import { autoinject } from 'aurelia-dependency-injection';
import { dispatchify } from 'aurelia-store';
import { logout } from 'store/actions';

@autoinject()
@customElement('nav-bar')
export class NavBar {
    @bindable router;
    @bindable loggedIn;

    private username = '';

    constructor(private dialogService: DialogService, private se: SteemEngine) {

    }

    loggedInChanged(bool) {
        if (bool) {
            this.username = localStorage.getItem('username');
        } else {
            this.username = '';
        }
    }

    logout() {
        this.se.logout();
    }

    signin() {
        this.dialogService.open({ viewModel: SigninModal }).whenClosed(response => {
            console.log(response);
        });
    }
}
