import { autoinject } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

@autoinject()
export class Wallet {
    private balances: BalanceInterface[];
    private tokenTable: HTMLTableElement;
    
    constructor(private se: SteemEngine) {

    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable();
    }
    
    async activate() {       
        this.balances = await this.se.loadBalances();

        console.log(this.balances);
    }
}
