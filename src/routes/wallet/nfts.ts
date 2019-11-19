import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class MyNfts {
    private loading = false;
    
    constructor(private se: SteemEngine) {

    }
}
