import { Redirect } from 'aurelia-router';
import { observable } from 'aurelia-binding';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';

import firebase from 'firebase/app';

@autoinject()
export class Balances {
    private searchValue = '';
    private columns = ['symbol'];

    private balances: BalanceInterface[];
    private balancesCopy: BalanceInterface[];
    private user;

    private tokenTable: HTMLTableElement;

    @observable() private hideZeroBalances = false;
    
    constructor(private se: SteemEngine, private taskQueue: TaskQueue) {

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

            const doc = await firebase.firestore().collection('users').doc(this.se.getUser()).get();

            if (doc.exists) {
                this.user = doc.data();
            }

            if (!this.balances) {
                return new Redirect('');
            }

            this.hideZeroBalancesChanged();
        } catch {
            return false;
        }
    }
    
    activate() {       
        this.balancesCopy = this.balances;

        this.user.wallet.hideZeroBalances;
    }

    hideZeroBalancesChanged() {
        this.taskQueue.queueTask(() => {
            if (this.balances) {
                if (this.user.wallet.hideZeroBalances) {
                    this.balances = this.balances.filter(t => parseFloat(t.balance) > 0);
                } else {
                    this.balances = this.balancesCopy;
                }
    
                const userRef = firebase.firestore().collection('users').doc(this.se.getUser());
    
                userRef.set(this.user, {
                    merge: true
                })
            }
        });
    }
}
