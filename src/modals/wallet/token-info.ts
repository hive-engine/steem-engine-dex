import { dispatchify, Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { environment } from 'environment';
import { Subscription } from 'rxjs';
import { State } from 'store/state';
import styles from './token-info.module.css';

@autoinject()
export class TokenInfoModal {
    private state: State;
    private subscription: Subscription;   
    private token: any;
    private styles = styles;

    constructor(private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue, private store: Store<State>) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;    
        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;
            }
        });
    }

    async activate(symbol) {
        this.token = this.state.tokens.find(x => x.symbol === symbol);        
    }
}
