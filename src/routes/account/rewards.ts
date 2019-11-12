import { Subscription } from 'rxjs';
import { SteemEngine } from 'services/steem-engine';
import { State } from 'store/state';
import { TaskQueue, autoinject, bindable } from "aurelia-framework";
import { dispatchify, Store } from 'aurelia-store';
import firebase, { User } from 'firebase/app';
import { DialogController } from 'aurelia-dialog';

@autoinject()
export class Rewards {
    @bindable loading = true;

    private state: State;    
    private subscription: Subscription;    

    private rewardTokens: IRewardToken[] = [];
    private rewardsTable: HTMLTableElement;

    constructor(private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue) {
        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;
            }
        });
    }

    async loadAccountScotUserTokens() {
        this.rewardTokens = [];
        this.state.account.scotTokens = await this.se.getScotUsertokens(this.state.account.name);

        if (this.state.account.scotTokens) {
            this.state.account.scotTokens.forEach((x: IScotToken) => {
                if (x.pending_token) {
                    var claimAmount = x.pending_token / Math.pow(10, x.precision);
                    var rewardToken: IRewardToken = { symbol: x.symbol, amount: claimAmount };
                    this.rewardTokens.push(rewardToken);
                }
            });
        }
    }

    async canActivate() {
        await this.loadAccountScotUserTokens();
    }

    async claimToken(symbol) {     
        const delay = t => new Promise(resolve => setTimeout(resolve, t));
        this.loading = true;

        try {
            var result = await this.se.claimToken(symbol);     
            
            if (result) {                
                await delay(5000);
                await this.loadAccountScotUserTokens();
            }
            
            this.loading = false;              
        } finally {
            this.loading = false;
        }
    }

    async attached() {  
        // @ts-ignore
        $(this.rewardsTable).DataTable({
            bInfo: false,
            paging: false,
            searching: false
        });

        this.loading = false;
    }    
}
