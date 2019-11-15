import { loadAccountBalances } from 'store/actions';
import { State } from './../store/state';
import { Store, dispatchify } from 'aurelia-store';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class CreateToken {
    private engBalance;

    constructor(private store: Store<State>) {

    }

    async activate() {
        await dispatchify(loadAccountBalances)();
    }
    
    bind() {
        this.store.state.subscribe(state => {
            // eslint-disable-next-line no-undef
            if (state?.account?.balances?.length) {
                const engToken = state.account.balances.find(token => token.symbol === 'ENG');

                if (engToken) {
                    this.engBalance = engToken.balance;
                }
            }
        });
    }
}
