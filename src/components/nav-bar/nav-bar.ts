import { State } from 'store/state';
import { SteemEngine } from './../../services/steem-engine';
import { SigninModal } from './../../modals/signin';
import { DialogService } from 'aurelia-dialog';
import { customElement, bindable } from 'aurelia-framework';
import { autoinject } from 'aurelia-dependency-injection';
import { connectTo } from 'aurelia-store';
import { faWallet } from '@fortawesome/pro-duotone-svg-icons';

import styles from './nav-bar.module.css';

@autoinject()
@customElement('nav-bar')
@connectTo()
export class NavBar {
    @bindable router;
    @bindable loggedIn;
    @bindable claims;
    @bindable iconWallet = faWallet;

    private styles = styles;

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
