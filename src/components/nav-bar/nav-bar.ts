import { customElement, bindable } from 'aurelia-framework';
import { autoinject } from 'aurelia-dependency-injection';
import { AppRouter } from 'aurelia-router';

@autoinject()
@customElement('nav-bar')
export class NavBar {
    @bindable router;
}
