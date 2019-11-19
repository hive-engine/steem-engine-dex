import { State } from 'store/state';
import { connectTo, dispatchify } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { getUserNfts } from 'store/actions';

@autoinject()
@connectTo()
export class MyNfts {
    private state: State;
    private loading = false;
    
    constructor(private se: SteemEngine) {

    }

    async activate() {
        await dispatchify(getUserNfts)();
    }
}
