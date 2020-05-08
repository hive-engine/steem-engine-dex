import { customElement, autoinject, bindable } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-pal';
import { DswapOrderModal } from './modals/dswap-order';
import { DialogService } from 'aurelia-dialog';

import styles from './dswap.module.css';




@autoinject()
export class Dswap {
    private router: Router;
    private styles = styles;

    constructor(private dialogService: DialogService ) {}
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
    withdraw() {
        this.dialogService.open({ viewModel: DswapOrderModal }).whenClosed(response => {
            console.log(response);
        });
    }
}
