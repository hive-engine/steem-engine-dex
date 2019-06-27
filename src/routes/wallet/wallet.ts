import { PLATFORM } from 'aurelia-pal';
import { Redirect, Router, RouterConfiguration } from 'aurelia-router';
import { autoinject, observable } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

import Styles from './wallet.module.css';

@autoinject()
export class Wallet {
    private router: Router;
    private styles = Styles;
    
    constructor(private se: SteemEngine) {

    }

    configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            { route: [''], name: 'balances', moduleId: PLATFORM.moduleName('./balances'), title: 'Balances', nav: true },
            { route: ['open-orders'], name: 'open-orders', moduleId: PLATFORM.moduleName('./open-orders'), title: 'Open Orders', nav: true },
        ]);

        this.router = router;
    }
}
