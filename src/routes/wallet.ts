import { autoinject } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

@autoinject()
export class Wallet {
    private balances: BalanceInterface[];
    private balancesCopy: BalanceInterface[];

    private tokenTable: HTMLTableElement;
    
    constructor(private se: SteemEngine) {

    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable();
    }
    
    async activate() {       
        this.balances = await this.se.loadBalances();
        this.balancesCopy = this.balances;

        console.log(this.balances);
    }
}
