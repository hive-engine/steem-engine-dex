import { State } from 'store/state';
import { Redirect } from 'aurelia-router';
import { observable } from 'aurelia-binding';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { loadTokens, loadBalances } from 'common/steem-engine';

import firebase from 'firebase/app';
import { connectTo, dispatchify } from 'aurelia-store';
import { getCurrentFirebaseUser, loadAccountBalances, loadTokensList } from 'store/actions';

@autoinject()
@connectTo()
export class Balances {
    private searchValue = '';
    private columns = ['symbol'];

    private balances: BalanceInterface[];
    private balancesCopy: BalanceInterface[];
    private user;
    private state: State;

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
            await dispatchify(loadTokensList)();
            await dispatchify(loadAccountBalances)();
            await dispatchify(getCurrentFirebaseUser)();

            this.hideZeroBalancesChanged();
            this.onlyShowFavourites();
        } catch {
            return new Redirect('');
        }
    }
    
    activate() {       
        this.balancesCopy = this.balances;
    }

    hideZeroBalancesChanged() {
        this.taskQueue.queueTask(() => {
            if (this.balances) {
                if (this.user.wallet.hideZeroBalances) {
                    this.balances = this.balances.filter(t => parseFloat(t.balance) > 0);
                } else {
                    this.balances = this.balancesCopy;
                }
                
                this.updateUser();
            }
        });
    }

    onlyShowFavourites() {
        this.taskQueue.queueTask(() => {
            if (this.balances) {
                if (this.user.wallet.onlyShowFavourites) {
                    this.balances = this.balances.filter((t: any) => t.isFavourite);
                } else {
                    this.balances = this.balancesCopy;
                }
                
                this.updateUser();
            }
        });
    }

    favouriteToken(token) {
        this.taskQueue.queueTask(() => {
            token.isFavourite = !token.isFavourite;

            this.balances.forEach((t: any) => {
                if (t.isFavourite && !this.user.favourites.includes(t.symbol)) {
                    this.user.favourites.push(t.symbol);
                } else if (!t.isFavourite && this.user.favourites.includes(t.symbol)) {
                    this.user.favourites.splice(this.user.favourites.indexOf(t.symbol), 1);
                }
            });

            this.onlyShowFavourites();
            this.updateUser();
        });
    }

    updateUser() {
        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        userRef.set(this.user, {
            merge: true
        });
    }
}
