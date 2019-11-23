import { usdFormat, toFixedNoRounding, addCommas } from 'common/functions';
import { Subscription } from 'rxjs';
import { State } from 'store/state';
import { Redirect } from 'aurelia-router';
import { observable } from 'aurelia-binding';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { TokenInfoModal } from 'modals/wallet/token-info';
import { SendTokensModal } from 'modals/wallet/send-tokens';
import { StakeModal } from 'modals/wallet/stake';
import { UnstakeModal } from 'modals/wallet/unstake';
import { DelegateModal } from 'modals/wallet/delegate';
import { UndelegateModal } from 'modals/wallet/undelegate';
import { EnableDelegationModal } from 'modals/wallet/issuers/enable-delegation';
import { EnableStakingModal } from 'modals/wallet/issuers/enable-staking';
import { EditTokenModal } from 'modals/wallet/issuers/edit-token';

import firebase from 'firebase/app';
import { dispatchify, Store } from 'aurelia-store';
import { getCurrentFirebaseUser, loadAccountBalances } from 'store/actions';
import styles from "./balances.module.css";
import { DialogService, DialogCloseResult } from 'aurelia-dialog';


@autoinject()
export class Balances {
    private searchValue = '';
    private columns = ['symbol'];

    private balances: BalanceInterface[] = [];
    private balancesCopy: BalanceInterface[] = [];
    private user;
    private state: State;
    private subscription: Subscription;
    private styles = styles;
    private totalWalletValue = 0.00;

    private tokenTable: HTMLTableElement;

    @observable() private hideZeroBalances = false;

    constructor(private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue, private dialogService: DialogService) {
        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;

                this.balancesCopy = [...state.account.balances];
                this.balances = [...state.account.balances];
                this.user = { ...state.firebaseUser };

                if (this?.user?.wallet) {
                    if (this.user.wallet.hideZeroBalances) {
                        this.balances = this.balances.filter(t => parseFloat(t.balance) > 0);
                    }
            
                    if (this.user.wallet.onlyShowFavourites) {
                        this.balances = this.balances.filter((t: any) => t.isFavourite);
                    }
                }
            }
        });
    }

    unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    attached() {
        for (const token of this.balances) {
            const amount = parseFloat(token.usdValue.replace('$', '').replace(',', ''));
            this.totalWalletValue += amount;
        }
        
        this.totalWalletValue = addCommas(this.totalWalletValue.toFixed(2)) as any;
        this.loadTable();
    }

    loadTable() {
        // @ts-ignore
        $(this.tokenTable).DataTable({
            "columnDefs": [
                { "targets": 0, "responsivePriority": 1 }, // Logo
                { "targets": 1, "responsivePriority": 2 }, // Symbol
                { "targets": 2, "responsivePriority": 10000 }, // Name
                { "targets": 3, "responsivePriority": 3, "type": "natural" }, // Balance                                
                { "targets": 4, "responsivePriority": 4, "type": "html-num-fmt" }, // USD
                { "targets": 5, "responsivePriority": 10010, "type": "html-num-fmt" }, // Change %
                { "targets": 6, "responsivePriority": 10020 }, // Staked
                { "targets": 7, "responsivePriority": 20000 }, // Actions
            ],
            "order": [[4, "desc"]],
            bInfo: false,
            paging: false,
            searching: false,
            responsive: true
        });
    }

    async canActivate() {
        try {
            await dispatchify(loadAccountBalances)();
            await dispatchify(getCurrentFirebaseUser)();
        } catch {
            return new Redirect('');
        }
    }

    hideZeroBalancesChanged() {
        this.taskQueue.queueTask(() => {
            if (this.balances && this.user.wallet) {
                if (this.user.wallet.hideZeroBalances) {
                    this.balances = this.balances.filter(t => parseFloat(t.balance) > 0);
                } else {
                    this.balances = this.balancesCopy;
                }

                if (this.user.wallet.onlyShowFavourites) {
                    this.balances = this.balances.filter((t: any) => t.isFavourite);
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

                if (this.user.wallet.hideZeroBalances) {
                    this.balances = this.balances.filter(t => parseFloat(t.balance) > 0);
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

    showTokenInfo(token) {
        this.dialogService
            .open({ viewModel: TokenInfoModal, model: token })
            .whenClosed(response => {
                //console.log(response);
            });
    }

    sendTokens(symbol) {
        this.dialogService
            .open({ viewModel: SendTokensModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    stakeTokens(symbol) {
        this.dialogService
            .open({ viewModel: StakeModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    unstakeTokens(symbol) {
        this.dialogService
            .open({ viewModel: UnstakeModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    delegateTokens(symbol) {
        this.dialogService
            .open({ viewModel: DelegateModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    undelegateTokens(symbol) {
        this.dialogService
            .open({ viewModel: UndelegateModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    enableDelegation(symbol) {
        this.dialogService
            .open({ viewModel: EnableDelegationModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    enableStaking(symbol) {
        this.dialogService
            .open({ viewModel: EnableStakingModal, model: symbol })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    editToken(token) {
        this.dialogService
            .open({ viewModel: EditTokenModal, model: token })
            .whenClosed(x => this.walletDialogCloseResponse(x));
    }

    async walletDialogCloseResponse(response: DialogCloseResult) {
        // reload balances if dialog response was success
        if (!response.wasCancelled) {
            await dispatchify(loadAccountBalances)();
        }
    }
}
