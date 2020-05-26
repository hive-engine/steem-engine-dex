import { customElement, autoinject, bindable } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';


import styles from './dswap.module.css';




@autoinject()
export class Dswap {
    private router: Router;
    private styles = styles;

    
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
                route: ['trades'],
                name: 'trades',
                moduleId: PLATFORM.moduleName('./components/trades'),
                nav: true,
                title: 'Trades',
            },
            {
                route: ['dswap-wallet'],
                name: 'dswapWallet',
                moduleId: PLATFORM.moduleName('./components/dswap-wallet'),
                nav: true,
                title: 'DSwap || Wallet',
            },
            {
                route: ['transactions'],
                name: 'transactions',
                moduleId: PLATFORM.moduleName('./components/transactions'),
                nav: true,
                title: 'Transactions',
            }
        ]);

        this.router = router;
        console.log(this.router);
    }
    
    addActive(e){
        $('.removeActivate').removeClass('activateIt');
        $('.dashboardActive').toggleClass('dashboardActive');
        $('#' + e).addClass('activateIt');
    }
}
