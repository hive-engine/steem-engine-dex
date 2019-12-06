import { DialogService } from 'aurelia-dialog';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';


import { connectTo, dispatchify } from 'aurelia-store';
import { getNft, getNftInstance } from 'store/actions';

import styles from './nft-showroom.module.css';

@autoinject()
@connectTo()

export class Nft {
    private styles = styles;
    private state: State;

    

}
