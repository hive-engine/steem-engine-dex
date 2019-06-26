import { Redirect } from 'aurelia-router';
import { autoinject, observable } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

import Styles from './wallet.module.css';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';

@autoinject()
export class Wallet {
    private styles = Styles;
    
    private balances: BalanceInterface[];
    private balancesCopy: BalanceInterface[];

    private tokenTable: HTMLTableElement;

    private searchValue = '';
    private columns = ['symbol'];
    private selectedTab = 'balances';

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
            await this.se.loadTokens();
            
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

        this.hideZeroBalances = localStorage.getItem('ui_hide_zero_balances') ? true : false;
    }

    selectTab(tab: string) {
        this.selectedTab = tab;
    }

    hideZeroBalancesChanged(val) {
        if (this.balances) {
            if (val) {
                localStorage.setItem('ui_hide_zero_balances', JSON.stringify(val));
                this.balances = this.balances.filter(t => parseFloat(t.balance) > 0);
            } else {
                localStorage.removeItem('ui_hide_zero_balances');

                this.balances = this.balancesCopy;
            }
        }
    }
}
