import { Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { State } from 'store/state';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from 'environment';

@autoinject()
export class DepositModal {
    private environment = environment;
    private subscription: Subscription;
    private user: any;
    private loading = false;
    private order = {};

    constructor(private controller: DialogController, private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(model) {
        this.order = model;
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

    confirmOrder() {
        
    }
}
