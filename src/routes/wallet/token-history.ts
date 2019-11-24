import { Subscription } from 'rxjs';
import { State } from 'store/state';
import { Redirect } from 'aurelia-router';
import { observable } from 'aurelia-binding';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { TokenHistoryTransactionModal } from 'modals/wallet/token-history-transaction';
import { SendTokensModal } from 'modals/wallet/send-tokens';
import { IssueTokensModal } from 'modals/wallet/issuers/issue-tokens';

import { dispatchify, Store } from 'aurelia-store';
import { loadAccountBalances, loadTokensList } from 'store/actions';
import styles from "./token-history.module.css";
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import moment from 'moment';
import { stateTokensOnlyPegged } from 'common/functions';



@autoinject()
export class TokenHistory {
    private searchValue = '';
    private columns = ['symbol'];

    private token: IToken;
    private transactions: ITokenHistoryTransaction[] = [];
    private username: any;
    private state: State;
    private subscription: Subscription;
    private styles = styles;
    private tokenBalance: number;

    private transactionsTable: HTMLTableElement;

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

    attached() {
        this.loadTable();        
    }

    loadTable() {
        // @ts-ignore
        $(this.transactionsTable).DataTable({
            bInfo: false,
            paging: false,
            searching: false,
            ordering: false
        });
    }

    async loadHistoryData(symbol) {    
        if (!this.state.tokens || this.state.tokens.length == 0 || stateTokensOnlyPegged(this.state.tokens)) {
            await dispatchify(loadTokensList)();
            await dispatchify(loadAccountBalances)();
        }

        this.token = this.state.tokens.find(x => x.symbol == symbol);                

        this.username = this.state.account.name;

        const history = await this.se.showHistory(symbol, this.state.account.name) as ITokenHistoryTransaction[];

        this.tokenBalance = await this.se.getBalance(symbol);

        let runningBalance = this.tokenBalance;

        history.forEach(x => {
            x.balance = runningBalance.toFixed(this.token.precision);
            runningBalance = (x.to == this.username) ? runningBalance - parseFloat(x.quantity) : runningBalance + parseFloat(x.quantity);
            const dt = new Date(x.timestamp);
            x.timestamp_string = moment(dt).format('YYYY-M-DD HH:mm:ss');
        })

        this.transactions = history;
    }

    async canActivate({ symbol }) {
        try {
            await this.loadHistoryData(symbol);
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
            await this.loadHistoryData(this.token.symbol);
        }
    }
}
