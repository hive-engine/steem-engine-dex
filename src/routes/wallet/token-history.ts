import { Subscription } from 'rxjs';
import { observable } from 'aurelia-binding';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue, bindable } from 'aurelia-framework';
import { TokenHistoryTransactionModal } from 'modals/wallet/token-history-transaction';
import { SendTokensModal } from 'modals/wallet/send-tokens';
import { IssueTokensModal } from 'modals/wallet/issuers/issue-tokens';

import { dispatchify, Store } from 'aurelia-store';
import { loadAccountBalances, loadTokensList } from 'store/actions';
import styles from "./token-history.module.css";
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import moment from 'moment';
import { stateTokensOnlyPegged } from 'common/functions';
import { loadAccountHistory } from 'common/steem-engine';



@autoinject()
export class TokenHistory {
    private searchValue = '';
    private columns = ['symbol'];

    private token: IToken;
    private transactions: IAccountHistoryItemResult[] = [];
    private username: any;
    private state: State;
    private subscription: Subscription;
    private styles = styles;
    private tokenBalance: number;
    private offset: number = 0;
    private limit: number = 5;
    private symbol;
    @bindable displayShowMore: boolean = true;

    @observable() private hideZeroBalances = false;

    constructor(private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue, private dialogService: DialogService) {
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

    async loadHistoryData() {    
        if (!this.state.tokens || this.state.tokens.length == 0 || stateTokensOnlyPegged(this.state.tokens)) {
            await dispatchify(loadTokensList)();
            await dispatchify(loadAccountBalances)();
        }

        this.token = this.state.tokens.find(x => x.symbol == this.symbol);                

        this.username = this.state.account.name;

        const history = await loadAccountHistory(this.username, this.symbol, null, null, this.limit, this.offset);

        this.offset += this.limit;        

        history.forEach(x => {
            x.timestamp_string = moment.unix(x.timestamp).format('YYYY-MM-DD HH:mm:ss');
        })

        if (history)
            this.transactions.push(...history);        

        // if we get < limit items, we reached the end
        if (history.length < this.limit)
            this.displayShowMore = false;
    }

    async canActivate({ symbol }) {
        try {
            this.symbol = symbol;
            this.tokenBalance = await this.se.getBalance(this.symbol);

            await this.loadHistoryData();
        } catch(e){
            console.log(e);
        }
    }

    viewTransaction(transaction) {
        this.dialogService
            .open({ viewModel: TokenHistoryTransactionModal, model: transaction })
            .whenClosed(x => {
                console.log(x);
            });
    }

    sendTokens(symbol) {
        this.dialogService
            .open({ viewModel: SendTokensModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    issueTokens(symbol) {
        this.dialogService
            .open({ viewModel: IssueTokensModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    async walletDialogCloseResponse(response: DialogCloseResult) {
        console.log(response);
        // reload balances if dialog response was success
        if (!response.wasCancelled) {
            await this.loadHistoryData();
        }
    }
}
