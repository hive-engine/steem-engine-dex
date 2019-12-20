import { query } from 'common/apollo';
import { Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { State } from 'store/state';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from 'environment';
import { toFixedNoRounding } from 'common/functions';

@autoinject()
export class WithdrawModal {
    private environment = environment;
    private subscription: Subscription;
    private user: any;
    private token: any = null;
    private depositInfo: any = null;
    private address = '';
    private loading = false;
    private tokenBalance: any = 0;
    private tokenList = [];

    private amount = '0.000';

    constructor(private controller: DialogController, private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    async activate() {
        const pairs = await query(`query {
            coinPairs {
                name,
                pegged_token_symbol,
                symbol
              }
        }`);     
        
        this.tokenList = pairs.data.coinPairs;
    }

    bind() {
        this.subscription = this.store.state.pipe(pluck('account')).subscribe((user: any) => {
            this.user = user;
        });
    }

    unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    tokenSelected() {
        this.taskQueue.queueMicroTask(async () => {
            this.tokenBalance = 0;

            if (this.token) {
                this.loading = true;
                const token = this.token.pegged_token_symbol;

                if (token !== 'STEEMP') {
                    try {
                        const result = await this.se.getWithdrawalAddress(token, this.address);

                        if (result) {
                            this.depositInfo = result;
                        }
                    } finally {
                        this.loading = false;
                    }
                }

                try {
                    const balanceResult = await this.se.getBalance(token);
                    if (balanceResult) {
                        this.tokenBalance = balanceResult;
                    }
                } finally {
                    this.loading = false;
                }
            }
        });
    }

    async depositSteem() {
        this.loading = true;

        try {
            const result = await this.se.depositSteem(parseFloat(this.amount).toFixed(3));

            if (result) {
                this.loading = false;
                this.controller.ok();
            } else {
                this.loading = false;
            }
        } finally {
            this.loading = false;
        }
    }

    balanceClicked() {
        this.amount = this.tokenBalance;
    }

    async handleWithdraw() {
        this.loading = true;

        try {
            if (this.token.symbol === 'STEEM') {
                const result = await this.se.withdrawSteem(toFixedNoRounding(parseFloat(this.amount), 3));

                if (result) {
                    this.loading = false;
                    this.controller.ok();
                } else {
                    this.loading = false;
                }
            }
        } finally {
            this.loading = false;
        }
    }
}
