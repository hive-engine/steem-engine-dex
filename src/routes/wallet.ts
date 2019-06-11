import { Redirect } from 'aurelia-router';
import { autoinject, observable } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

import Styles from './wallet.css';

@autoinject()
export class Wallet {
    private styles = Styles;
    
    private balances: BalanceInterface[];
    private balancesCopy: BalanceInterface[];

    private tokenTable: HTMLTableElement;

    @observable() private hideZeroBalances = false;
    
    constructor(private se: SteemEngine) {

    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable({
            bInfo: false,
            paging: false,
            searching: false
        });
    }

    async canActivate() {
        try {
            this.balances = await this.se.loadBalances();

            if (!this.balances) {
                return new Redirect('');
            }
        } catch {
            return false;
        }
    }
    
    activate() {       
        this.balancesCopy = this.balances;

        console.log(this.balances);
    }

    hideZeroBalancesChanged(val) {
        if (val) {
            this.balances = this.balances.filter(t => parseFloat(t.balance) > 0);
        } else {
            this.balances = this.balancesCopy;
        }
    }
}
