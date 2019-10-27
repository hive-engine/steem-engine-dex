import { State } from 'store/state';
import { SteemEngine } from './../../services/steem-engine';
import { SigninModal } from './../../modals/signin';
import { DialogService } from 'aurelia-dialog';
import { customElement, bindable } from 'aurelia-framework';
import { autoinject } from 'aurelia-dependency-injection';
import { dispatchify, connectTo } from 'aurelia-store';
import { logout } from 'store/actions';
import { faWallet } from '@fortawesome/pro-duotone-svg-icons'

@autoinject()
@customElement('nav-bar')
@connectTo()
export class NavBar {
    @bindable router;
    @bindable loggedIn;
    @bindable iconWallet = faWallet;

    private state: State;

    constructor(private dialogService: DialogService, private se: SteemEngine) {        
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
