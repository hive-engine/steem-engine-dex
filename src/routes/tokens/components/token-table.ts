import { TokenInfoModal } from 'modals/wallet/token-info';
import styles from './token-table.module.css';
import { bindable, TaskQueue, autoinject } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';
import { DialogService } from 'aurelia-dialog';
import { dispatchify, connectTo } from 'aurelia-store';
import { getCurrentFirebaseUser } from 'store/actions';
import firebase from 'firebase/app';

@autoinject()
@connectTo()
export class TokenTable {
    private searchValue = '';
    private styles = styles;
    @bindable tokens;
    @bindable tableId;
    @bindable tab;
    private state: State;
    private loading = true;    

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {
        this.loading = true;
    }

    async activate() {
        await dispatchify(getCurrentFirebaseUser)();
    }

    attached() {             
        this.taskQueue.queueMicroTask(() => {
            this.applyDatatable();            
            this.loading = false;
        });
    }

    applyDatatable() {
        // @ts-ignore
        $('#' + this.tableId).DataTable({
            order: [],
            columnDefs: [
                {
                    targets: 'no-sort',
                    orderable: false,
                },
                { targets: 0, responsivePriority: 1 }, // Logo
                { targets: 1, responsivePriority: 2 }, // Symbol
                { targets: 2, responsivePriority: 10000 }, // Name
                { targets: 3, responsivePriority: 10010, type: 'html-num-fmt' }, // Market cap
                { targets: 4, responsivePriority: 3, type: 'html-num-fmt' }, // price
                { targets: 5, responsivePriority: 10020, type: 'html-num-fmt' }, // Change %
                { targets: 6, responsivePriority: 4, type: 'html-num-fmt' }, // 24h volume
                { targets: 7, responsivePriority: 10030 }, // Supply
                { targets: 8, responsivePriority: 20000 }, // Actions
            ],
            destroy: true,
            bInfo: false,
            paging: true,
            searching: false,
            responsive: true
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

    showTokenInfo(token) {
        this.dialogService.open({ viewModel: TokenInfoModal, model: token }).whenClosed(response => {
            //console.log(response);
        });
    }
}
