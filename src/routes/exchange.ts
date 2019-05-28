import { SteemEngine } from '../services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { environment } from 'environment';

@autoinject()
export class Exchange {
    private currentToken: string;

    constructor(private se: SteemEngine) {

    }

    activate({symbol}) {
        this.currentToken = symbol;

        this.se.loadTokens();
    }
}
