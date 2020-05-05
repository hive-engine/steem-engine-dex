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
    private pageSize = 10;
    private filters = [{ value: '', keys: ['symbol', 'name'] }];
    private state: State;
    private loading = true;    

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {
        this.loading = true;
    }

    async activate() {        
        await dispatchify(getCurrentFirebaseUser)();
    }

    attached() {      
        this.loading = false;
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
