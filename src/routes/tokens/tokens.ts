import { TokenInfoModal } from 'modals/wallet/token-info';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, observable, TaskQueue, bindable } from 'aurelia-framework';

import { connectTo, dispatchify } from 'aurelia-store';
import { loadTokensList, loadTokenSymbols, getCurrentFirebaseUser } from 'store/actions';

import styles from './tokens.module.css';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import { BuyTokenModal } from 'modals/buy-token';
import { DepositModal } from 'modals/deposit';
import { WithdrawModal } from 'modals/withdraw';
import { loadTokens } from 'common/steem-engine';

@autoinject()
@connectTo()
export class Tokens {    
    private styles = styles;
    private state: State;
    private loading = false;    
    private peggedTokens = [];
    private currentLimit = 1000;
    private currentOffset = 0;
        
    @bindable tab = 'engine';

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate() {
         this.peggedTokens = await loadTokens(['BCHP',
                    'BTCP',
                    'DOGEP',
                    'STEEMP',
                    'BRIDGEBTCP',
                    'BTSCNYP',
                    'BTSP',
                    'LTCP',
                    'PEOSP',
                    'SWIFTP',
                    'TLOSP',
                    'WEKUP',
                ],
                50,
                0
            );

        await dispatchify(loadTokensList)(this.currentLimit, this.currentOffset);                
    }

    async activate() {
        await dispatchify(getCurrentFirebaseUser)();
    }

    async loadMoreTokens() {
        this.currentOffset++;

        const limit = this.currentOffset * this.currentLimit;
        const offset = (this.currentOffset + 1) * this.currentLimit;

        this.loading = true;
        await dispatchify(loadTokensList)(limit, offset);

        this.loading = false;
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

    showTokenInfo(token) {
        this.dialogService.open({ viewModel: TokenInfoModal, model: token }).whenClosed(response => {
            //console.log(response);
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
