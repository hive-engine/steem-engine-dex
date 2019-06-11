import { Store } from 'aurelia-store';
import { customElement, bindable } from 'aurelia-framework';
import { autoinject } from 'aurelia-dependency-injection';
import { AppRouter } from 'aurelia-router';
import { State } from 'store/state';
import { pluck, map } from 'rxjs/operators'
import { Observable } from 'rxjs';

@autoinject()
@customElement('nav-bar')
export class NavBar {
    @bindable router;
    @bindable loggedIn;
}
