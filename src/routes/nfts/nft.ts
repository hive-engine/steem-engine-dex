import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';


import { connectTo, dispatchify } from 'aurelia-store';
import { getNft } from 'store/actions';

import styles from './nft.module.css';

@autoinject()
@connectTo()

export class Nft {
    private styles = styles;
    private state: State;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {}

    async activate({ symbol }) {
        dispatchify(getNft)(symbol);
    }
}
