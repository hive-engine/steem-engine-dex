// import { DialogService } from 'aurelia-dialog';
// import { NftPropertiesModal } from './../../modals/nft/nft-properties';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { slick } from 'slick-carousel/slick/slick';



import { connectTo, dispatchify } from 'aurelia-store';
import { getNft, getNftInstance } from 'store/actions';

import styles from './nft-detail.module.css';

@autoinject()
@connectTo()
export class nftDetail {
    private styles = styles;
    private state: State;
    private Slick = slick;
    private tokenTable: HTMLTableElement;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {}


}
