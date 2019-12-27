import { TokenInfoModal } from 'modals/wallet/token-info';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';


import { connectTo, dispatchify } from 'aurelia-store';
import { getNfts } from 'store/actions';

import styles from './nfts.module.css';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';

@autoinject()
@connectTo()
export class Nfts {
    private styles = styles;
    private tokenTable: HTMLTableElement;
    private state: State;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate() {
        await dispatchify(getNfts)();
    }

    async walletDialogCloseResponse(response: DialogCloseResult) {
        console.log(response);
    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable({
            order: [],
            columnDefs: [
                {
                    targets: 'no-sort',
                    orderable: false,
                },
            ],
            bInfo: false,
            paging: false,
            searching: false,
        });
    }

    showTokenInfo(symbol) {
        this.dialogService.open({ viewModel: TokenInfoModal, model: symbol }).whenClosed(response => {
            //console.log(response);
        });
    }
}
