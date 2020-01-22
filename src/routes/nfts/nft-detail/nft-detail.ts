import { sleep } from 'common/functions';
import { checkTransaction } from 'common/steem-engine';
import { MarketService } from './../../../services/market-service';
import { PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { slick } from 'slick-carousel/slick/slick';
import ImageZoom from 'js-image-zoom/js-image-zoom';
import { faStar } from '@fortawesome/pro-duotone-svg-icons';
import { bindable } from 'aurelia-framework';
import { connectTo, dispatchify } from 'aurelia-store';
import { getNft, getNftSellBook, loading, getNftById, resetInstance } from 'store/actions';

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
    private errors: string[] = [];

    private options = {
        width: 750,
        height: 400,
        zoomWidth: 500,
        offset: { vertical: 0, horizontal: 10 },
    };

    constructor(private se: SteemEngine, private marketService: MarketService, private taskQueue: TaskQueue) {}

    // public configureRouter(config: RouterConfiguration, router: Router) {
    //     config.map([
    //         {
    //             route: [''],
    //             name: 'nft-overview',
    //             moduleId: PLATFORM.moduleName('./nft-detail-full/nft-overview'),
    //             nav: true,
    //             title: 'NFT Overview',
    //         },
    //         {
    //             route: ['nft-reviews'],
    //             name: 'nft-reviews',
    //             moduleId: PLATFORM.moduleName('./nft-detail-full/nft-reviews'),
    //             nav: true,
    //             title: 'NFT Reviews',
    //         },
    //     ]);

    //     this.router = router;
    // }
    attached() {
        ImageZoom(document.getElementById('container'), this.options);
    }

    async activate({ symbol, id }) {
        dispatchify(resetInstance)();
        
        await dispatchify(getNft)(symbol);
        await dispatchify(getNftSellBook)(symbol);

        if (id) {
            await dispatchify(getNftById)(symbol, id);
        }
    }

    async buy(order) {
        dispatchify(loading)(true);

        try {
            const request = await this.marketService.buy(order.symbol, order._id) as any;

            if (request.success) {
                try {
                    const verify = await checkTransaction(request.result.id, 3);
                    
                    if (verify?.errors) {
                        this.errors = verify.errors;
                    } else {
                        await sleep(3200);
                        window.location.reload();
                    }
                } catch (e) {
                    console.error(e);
                }
            }


            dispatchify(loading)(false);
        } catch {
            dispatchify(loading)(false);
        }
    }
}
