import { Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { State } from 'store/state';
import { pluck } from 'rxjs/operators';

@autoinject()
export class DepositModal {
    private user: any;

    constructor(private controller: DialogController, private se: SteemEngine, private store: Store<State>) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    bind() {
        this.store.state.pipe(pluck('account')).subscribe((user: any) => {
            this.user = user;
        });
    }
}
