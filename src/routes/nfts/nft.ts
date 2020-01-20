import { NftPropertiesModal } from './../../modals/nft/nft-properties';
import { DialogService } from 'aurelia-dialog';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';


import { connectTo, dispatchify } from 'aurelia-store';
import { getNft, getNftInstance } from 'store/actions';

import styles from './nft.module.css';

@autoinject()
@connectTo()

export class Nft {
    private styles = styles;
    private state: State;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async activate({ symbol }) {
        await dispatchify(getNft)(symbol);
        await dispatchify(getNftInstance)(symbol);
    }

    showNftProperties(token) {
        this.dialogService.open({ viewModel: NftPropertiesModal, model: token }).whenClosed(response => {
            //console.log(response);
        });
    }

    userCanIssue(token) {
        console.log(token);
        if (token.authorizedIssuingAccounts && token.authorizedIssuingAccounts.includes(this.state.account.name)) {
            return true;
        }

        return false;
    }
}
