// import { DialogService } from 'aurelia-dialog';
// import { NftPropertiesModal } from './../../modals/nft/nft-properties';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { slick } from 'slick-carousel/slick/slick';



import { connectTo, dispatchify } from 'aurelia-store';
import { getNft, getNftInstance } from 'store/actions';

import styles from './nft-showroom.module.css';

@autoinject()
@connectTo()
export class Nft {
    private styles = styles;
    private state: State;
    private Slick = slick;
    private tokenTable: HTMLTableElement;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {}

    // async activate({ symbol }) {
    //     await dispatchify(getNft)(symbol);
    //     await dispatchify(getNftInstance)(symbol);
    // }
    // attached() {
    //     // @ts-ignore
    //     $(this.tokenTable).DataTable({
    //         order: [],
    //         columnDefs: [
    //             {
    //                 targets: 'no-sort',
    //                 orderable: false,
    //             },
    //         ],
    //         bInfo: false,
    //         paging: false,
    //         searching: false,
    //     });
    // }

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
