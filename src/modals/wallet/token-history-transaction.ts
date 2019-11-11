import { Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { Subscription } from 'rxjs';
import { State } from 'store/state';
import styles from './token-history-transaction.module.css';

@autoinject()
export class TokenHistoryTransactionModal {
    private styles = styles;
    private loading = false;
    private state: State;
    private subscription: Subscription;   
    private token: any;
    private validationController;
    private renderer;
    private transaction: ITokenHistoryTransaction;
    private username: string;

    constructor(private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue, private store: Store<State>) {
        

        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;    
        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;
            }
        });
    }

    async activate(tx) {
        this.transaction = tx;
        this.username = this.state.account.name;
    }
}
