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
export class UserProfile {
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
                route: ['directory'],
                name: 'directory',
                moduleId: PLATFORM.moduleName('./components/directory'),
                nav: true,
                title: 'Directory',
            },
        ]);

        this.router = router;
    }

    showMore() {
        $('#more-less').css('display', 'block');
        $('#more-btn').css('display', 'none');
        $('#less-btn').css('display', 'block');
        console.log('here is more')
    }
    showLess() {
        $('#more-less').css('display', 'none');
        $('#more-btn').css('display', 'block');
        $('#less-btn').css('display', 'none');
        console.log('here is more')
    }

}
