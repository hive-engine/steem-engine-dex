import { PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { slick } from 'slick-carousel/slick/slick';
import ImageZoom from 'js-image-zoom/js-image-zoom';
import { faStar } from '@fortawesome/pro-duotone-svg-icons';
import { bindable } from 'aurelia-framework';
import { connectTo, dispatchify } from 'aurelia-store';
import { getNft } from 'store/actions';

import styles from './nft-detail.module.css';

@autoinject()
@connectTo()
export class NftDetail {
    @bindable iconStar = faStar;
    private router: Router;
    private styles = styles;
    private state: State;
    private Slick = slick;
    private tokenTable: HTMLTableElement;
    private options = {
        width: 650,
        height: 350,
        zoomWidth: 500,
        offset: { vertical: 0, horizontal: 10 },
    };

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {}
    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: [''],
                name: 'nft-overview',
                moduleId: PLATFORM.moduleName('./nft-detail-full/nft-overview'),
                nav: true,
                title: 'NFT Overview',
            },
            {
                route: ['nft-reviews'],
                name: 'nft-reviews',
                moduleId: PLATFORM.moduleName('./nft-detail-full/nft-reviews'),
                nav: true,
                title: 'NFT Reviews',
            },
        ]);

        this.router = router;
    }
    attached() {
        ImageZoom(document.getElementById('container'), this.options);
    }
    async activate({ symbol }) {
        await dispatchify(getNft)(symbol);

        // await dispatchify(getNftSellBook)(symbol);

    }
}
