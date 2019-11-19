import { Subscription } from 'rxjs';
import { SteemEngine } from 'services/steem-engine';
import { State } from 'store/state';
import { TaskQueue, autoinject, bindable } from "aurelia-framework";
import { Store } from 'aurelia-store';

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

    unbind() {
        this.subscription.unsubscribe();
    }

    async loadAccountScotUserTokens() {
        this.rewardTokens = [];
        this.state.account.scotTokens = await this.se.getScotUsertokens(this.state.account.name);

        if (this.state.account.scotTokens) {
            this.state.account.scotTokens.forEach((x: IScotToken) => {
                if (x.pending_token) {
                    const claimAmount = x.pending_token / Math.pow(10, x.precision);
                    const rewardToken: IRewardToken = { symbol: x.symbol, amount: claimAmount };
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
            const result = await this.se.claimToken(symbol);

            if (result) {
                await delay(5000);
                await this.loadAccountScotUserTokens();
            }

            this.loading = false;
        } finally {
            this.loading = false;
        }
    }

    async claimAllTokens() {
        const delay = t => new Promise(resolve => setTimeout(resolve, t));
        this.loading = true;

        try {
            const result = await this.se.claimAllTokens(this.rewardTokens);

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
            columnDefs: [
                { type: "natural", targets: "_all" }
            ],
            bInfo: false,
            paging: false,
            searching: false
        });

        this.loading = false;
    }
}
