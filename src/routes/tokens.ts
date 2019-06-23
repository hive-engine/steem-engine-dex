import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
@autoinject()
export class Tokens {
    private tokenTable: HTMLTableElement;
    private tokens = [];

    constructor(private se: SteemEngine) {

    }

    async canActivate() {
        this.tokens = await this.se.loadTokens() as any;
        console.log(this.tokens);
    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable({
            bInfo: false,
            paging: false,
            searching: false
        });
    }
}
