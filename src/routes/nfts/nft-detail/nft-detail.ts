import { NftChangeSellPriceModal } from './../../../modals/nft/nft-change-price';
import { DialogService } from 'aurelia-dialog';
import { NftPropertiesModal } from './../../../modals/nft/nft-properties';
import { sleep } from 'common/functions';
import { checkTransaction } from 'common/steem-engine';
import { MarketService } from './../../../services/market-service';
import { Router } from 'aurelia-router';
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

    constructor(private se: SteemEngine, private dialogService: DialogService, private marketService: MarketService, private taskQueue: TaskQueue) {}

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

        dispatchify(getNftSellBook)(symbol, true);

        if (id) {
            await dispatchify(getNftById)(symbol, id);
        }
    }

    showNftProperties(token) {
        this.dialogService.open({ viewModel: NftPropertiesModal, model: token }).whenClosed(response => {
            //console.log(response);
        });
    }

    changeSellPrice(order, symbol) {
        this.dialogService.open({ viewModel: NftChangeSellPriceModal, model: { order, symbol } }).whenClosed(response => {
            //console.log(response);
        });
    }

    async cancelOrder(order, symbol) {
        dispatchify(loading)(true);

        try {
            const request = await this.marketService.cancel(symbol, order.nftId) as any;

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

    async buy(order, symbol) {
        dispatchify(loading)(true);

        try {
            const request = await this.marketService.buy(symbol, order.nftId) as any;

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
