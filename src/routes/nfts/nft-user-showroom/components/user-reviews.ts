import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { connectTo, dispatchify } from 'aurelia-store';
import { getNftsWithSellBook } from 'store/actions';

import { slick } from 'slick-carousel/slick/slick';
import styles from '../nft-user-showroom.module.css';

@autoinject()
@connectTo()
export class userReview {
    private styles = styles;
    private state: State;
    private Slick = slick;
    private tokenTable: HTMLTableElement;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {}

    async canActivate() {
        await dispatchify(getNftsWithSellBook)();
    }
}
