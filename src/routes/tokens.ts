import { TokenInfoModal } from 'modals/wallet/token-info';
import { State } from './../store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, observable, TaskQueue } from 'aurelia-framework';

import firebase from 'firebase/app';
import { connectTo, dispatchify } from 'aurelia-store';
import { loadTokensList, loadTokenSymbols, getCurrentFirebaseUser } from 'store/actions';

import styles from './tokens.module.css';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { BuyTokenModal } from 'modals/buy-token';
import { DepositModal } from 'modals/deposit';
import { WithdrawModal } from 'modals/withdraw';

@autoinject()
@connectTo()
export class Tokens {
    private styles = styles;
    private tokenTable: HTMLTableElement;
    private state: State;
    private loading = false;

    private datatable;

    private currentLimit = 1000;
    private currentOffset = 0;

    @observable() private tab = 'other';

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate () {
        await dispatchify(loadTokensList)(this.currentLimit, this.currentOffset);
    }

    async activate() {
        await dispatchify(getCurrentFirebaseUser)();
    }

    async loadMoreTokens() {
        this.currentOffset++;

        const limit = this.currentOffset * this.currentLimit;
        const offset = (this.currentOffset + 1) * this.currentLimit;

        this.loading = true;

        await dispatchify(loadTokensList)(limit, offset);

        this.loading = false;
    }

    async tabChanged(tab) {
        this.loading = true;

        if (tab === 'pegged') {
            await dispatchify(loadTokenSymbols)(
                [
                    'BCHP',
                    'BTCP',
                    'DOGEP',
                    'STEEMP',
                    'BRIDGEBTCP',
                    'BTSCNYP',
                    'BTSP',
                    'LTCP',
                    'PEOSP',
                    'SWIFTP',
                    'TLOSP',
                    'WEKUP',
                ],
                50,
                0,
            );
        } else if (tab === 'other') {
            await dispatchify(loadTokensList)(this.currentLimit, this.currentOffset);
        }
        this.loading = false;
    }

    buyENG() {
        this.dialogService
            .open({ viewModel: BuyTokenModal, model: 'ENG' })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    async walletDialogCloseResponse(response: DialogCloseResult) {
        console.log(response);

        // reload data if necessary
        if (!response.wasCancelled) {
        }
    }

    attached() {
        this.applyDatatable();
    }

    applyDatatable() {
        // @ts-ignore
        this.datatable = $(this.tokenTable).DataTable({
            order: [],
            columnDefs: [
                {
                    targets: 'no-sort',
                    orderable: false,
                },
                { targets: 0, responsivePriority: 1 }, // Logo
                { targets: 1, responsivePriority: 2 }, // Symbol
                { targets: 2, responsivePriority: 10000 }, // Name
                { targets: 3, responsivePriority: 10010 }, // Market cap
                { targets: 4, responsivePriority: 3 }, // price
                { targets: 5, responsivePriority: 10020 }, // Change %
                { targets: 6, responsivePriority: 4 }, // 24h volume
                { targets: 7, responsivePriority: 10030 }, // Supply
                { targets: 8, responsivePriority: 20000 }, // Actions
            ],
            destroy: true,
            bInfo: false,
            paging: false,
            searching: false,
            responsive: true,
        });
    }

    showTokenInfo(token) {
        this.dialogService.open({ viewModel: TokenInfoModal, model: token }).whenClosed(response => {
            //console.log(response);
        });
    }

    favouriteToken(token) {
        this.taskQueue.queueTask(() => {
            token.isFavourite = !token.isFavourite;

            this.state.tokens.forEach((t: any) => {
                if (t.isFavourite && !this.state.firebaseUser.favourites.includes(t.symbol)) {
                    this.state.firebaseUser.favourites.push(t.symbol);
                } else if (!t.isFavourite && this.state.firebaseUser.favourites.includes(t.symbol)) {
                    this.state.firebaseUser.favourites.splice(this.state.firebaseUser.favourites.indexOf(t.symbol), 1);
                }
            });

            const userRef = firebase
                .firestore()
                .collection('users')
                .doc(this.se.getUser());

            userRef.set(this.state.firebaseUser, {
                merge: true,
            });
        });
    }
    deposit() {
        this.dialogService.open({ viewModel: DepositModal }).whenClosed(response => {
            console.log(response);
        });
    }
    withdraw() {
        this.dialogService.open({ viewModel: WithdrawModal }).whenClosed(response => {
            console.log(response);
        });
    }
}
