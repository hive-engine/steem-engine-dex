import { customElement, autoinject, bindable } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';

import styles from './dswap.module.css';




@autoinject()
export class Dswap {
    private router: Router;
    private styles = styles;

    constructor() {}
    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: [''],
                name: 'dashboard',
                moduleId: PLATFORM.moduleName('./components/dashboard'),
                nav: true,
                title: 'Dashboard',
            },
            {
                route: ['trade'],
                name: 'trade',
                moduleId: PLATFORM.moduleName('./components/trade'),
                nav: true,
                title: 'Trade',
            },
            
        ]);

        this.router = router;
    }
}
