import { loadTokensList, loadConversionHistory } from 'store/actions';
import { Store, dispatchify } from 'aurelia-store';
import { autoinject, bindable } from 'aurelia-framework';
import { Subscription } from 'rxjs';
import firebase from 'firebase/app';
import { SteemEngine } from 'services/steem-engine';
import moment from 'moment';
import { loadAccountHistory } from 'common/steem-engine';

@autoinject()
export class AccountHistory {
    private state: State;
    private username: string;
    private subscription: Subscription;
    @bindable transactions: IAccountHistoryItemResult[] = [];    
    private offset: number = 0;
    private limit: number = 5;
    @bindable displayShowMore: boolean = true;

    constructor(private se: SteemEngine, private store: Store<State>) {
        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;
            }
        });
    }

    unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    async activate() {
        this.username = 'steemsc';// this.state.account.name;
        
        await this.loadTransactions();
    }

    async loadTransactions() {
        let transactions = await loadAccountHistory(this.username, null, null, null, this.limit, this.offset);
        
        transactions.forEach(x => {
            x.timestamp_string = moment.unix(x.timestamp).format('YYYY-MM-DD HH:mm:ss');
        })

        if (transactions)
            this.transactions.push(...transactions);

        // if we get < limit items, we reached the end
        if (transactions.length < this.limit)
            this.displayShowMore = false;

        this.offset += this.limit;
    }    
}
