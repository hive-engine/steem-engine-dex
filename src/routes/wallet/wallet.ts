import { environment } from 'environment';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';
import { autoinject, customElement, bindable } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

import { DepositModal } from 'modals/deposit';
import { WithdrawModal } from 'modals/withdraw';
import { DialogService } from 'aurelia-dialog';
// import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

import Styles from './wallet.module.css';

@autoinject()
export class Wallet {
    private router: Router;
    private styles = Styles;
    // private eventAggregator: EventAggregator;

    // @bindable token;
    // @bindable hideButtons = false;

    constructor(private se: SteemEngine, private dialogService: DialogService) {}

    configureRouter(config: RouterConfiguration, router: Router) {
        const routes = [
            {
                route: [''],
                name: 'balances',
                moduleId: PLATFORM.moduleName('./balances'),
                title: 'Balances',
                nav: true,
            },
            {
                route: ['open-orders'],
                name: 'open-orders',
                moduleId: PLATFORM.moduleName('./open-orders'),
                title: 'Open Orders',
                nav: true,
            },
            {
                route: ['pending-withdrawals'],
                name: 'pending-withdrawals',
                moduleId: PLATFORM.moduleName('./pending-withdrawals'),
                title: 'Pending Withdrawals',
                nav: true,
            },
        ];

        if (environment.features.nfts.enabled) {
            routes.push({
                route: ['nfts'],
                name: 'nfts',
                moduleId: PLATFORM.moduleName('./nfts'),
                title: 'My NFTs',
                nav: true,
            });
        }

        config.map(routes);

        this.router = router;
    }

    deposit() {
        this.dialogService.open({ viewModel: DepositModal }).whenClosed(response => {
            console.log(response);
        });
    }

    withdraw() {
        this.dialogService.open({ viewModel: WithdrawModal }).whenClosed(response => {
            console.log(response);
        });
    }
}
