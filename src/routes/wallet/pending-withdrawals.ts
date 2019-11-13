import { first, pluck } from 'rxjs/operators';
import { State } from './../../store/state';
import { dispatchify, Store } from 'aurelia-store';
import { Redirect } from 'aurelia-router';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { getPendingWithdrawals } from 'store/actions';
import { Observable } from 'rxjs';

@autoinject()
export class OpenOrders {
    private loadingWithdrawals = false;
    private hasWithdrawals = false;

    private withdrawalObs: Observable<any[]>;
    
    constructor(private se: SteemEngine, private store: Store<State>) {

    }

    async canActivate() {
        try {
            this.loadingWithdrawals = true; 

            await dispatchify(getPendingWithdrawals)();

            this.loadingWithdrawals = false;
        }  catch (e) {
            this.loadingWithdrawals = false;

            return new Redirect('/wallet');
        }
    }

    bind() {
        this.withdrawalObs = this.store.state.pipe(pluck('pendingWithdrawals'));
        this.withdrawalObs.pipe(first()).subscribe(withdrawals => this.hasWithdrawals = withdrawals.length > 0);
    }
}
