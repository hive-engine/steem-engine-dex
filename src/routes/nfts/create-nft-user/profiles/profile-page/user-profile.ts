import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { connectTo, dispatchify } from 'aurelia-store';
import { getNftsWithSellBook } from 'store/actions';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';

import { slick } from 'slick-carousel/slick/slick';
import styles from './user-profile.module.css';

@autoinject()
@connectTo()
export class nftUserShowroom {
    private router: Router;
    private styles = styles;
    private state: State;
    private Slick = slick;
    private tokenTable: HTMLTableElement;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {}
    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: [''],
                name: 'allCollections',
                moduleId: PLATFORM.moduleName('./components/all-user-collection'),
                nav: true,
                title: 'All',
            },
            {
                route: ['user-reviews'],
                name: 'userReviews',
                moduleId: PLATFORM.moduleName('./components/user-reviews'),
                nav: true,
                title: 'User Reviews',
            },
        ]);

        this.router = router;
    }

    async canActivate() {
        await dispatchify(getNftsWithSellBook)();
    }
}
