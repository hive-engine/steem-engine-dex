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

    loggedInChanged(bool) {
        if (bool) {
            this.username = localStorage.getItem('username');
        } else {
            this.username = '';
        }
    }

    logout() {
        dispatchify(logout)();
    }
}
