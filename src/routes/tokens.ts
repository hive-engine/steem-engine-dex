import { TokenInfoModal } from 'modals/wallet/token-info';
import { State } from './../store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';

import firebase from 'firebase/app';
import { connectTo, dispatchify } from 'aurelia-store';
import { loadTokensList, getCurrentFirebaseUser } from 'store/actions';

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

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate() {
        await dispatchify(loadTokensList)();
    }

    async activate() {
        await dispatchify(getCurrentFirebaseUser)();
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
        // @ts-ignore
        $(this.tokenTable).DataTable({
            order: [],
            columnDefs: [
                {
                    targets: 'no-sort',
                    orderable: false,
                },
            ],
            bInfo: false,
            paging: false,
            searching: false,
        });
    }

    showTokenInfo(symbol) {
        this.dialogService.open({ viewModel: TokenInfoModal, model: symbol }).whenClosed(response => {
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
