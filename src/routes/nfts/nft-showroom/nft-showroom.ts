import { TokenInfoModal } from 'modals/wallet/token-info';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { connectTo, dispatchify } from 'aurelia-store';
import { getNfts } from 'store/actions';

import { slick } from 'slick-carousel/slick/slick';
import styles from './nft-showroom.module.css';

@autoinject()
@connectTo()
export class Nft {
    private styles = styles;
    private state: State;
    private Slick = slick;
    private tokenTable: HTMLTableElement;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {}

    async canActivate() {
        await dispatchify(getNfts)();
    }

    attached() {
        // @ts-ignore
        $('.nft-extra-cards').slick({
            dots: true,
            arrows: true,
            infinite: false,
            speed: 300,
            autoplay: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                        infinite: true,
                        dots: true,
                    },
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                    },
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    },
                },
                // You can unslick at a given breakpoint now by adding:
                // settings: "unslick"
                // instead of a settings object
            ],
        });
    }
}
