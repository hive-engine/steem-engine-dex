import { sleep } from 'common/functions';
import { NftSellModal } from './../../modals/nft/nft-sell';
import { NftService } from './../../services/nft-service';
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

    constructor(private se: SteemEngine, private nftService: NftService, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async activate({ symbol }) {
        await dispatchify(getNft)(symbol);
        await dispatchify(getNftInstance)(symbol);

        
    }

    showNftProperties(token) {
        this.dialogService.open({ viewModel: NftPropertiesModal, model: token }).whenClosed(response => {
            //console.log(response);
        });
    }

    sellNft(token) {
        token.symbol = this.state.nft.symbol;
        
        this.dialogService.open({ viewModel: NftSellModal, model: token }).whenClosed(async (result) => {
            if (!result.wasCancelled) {
                await sleep(3200);
                
                window.location.reload();
            }
        })
    }

    userCanModify(token) {
        if (token.issuer === this.state.account.name || token.authorizedIssuingAccounts && token.authorizedIssuingAccounts.includes(this.state.account.name)) {
            return true;
        }

        return false;
    }

    userCanIssue(token) {
        if (token.issuer === this.state.account.name || token.authorizedIssuingAccounts && token.authorizedIssuingAccounts.includes(this.state.account.name)) {
            return true;
        }

        return false;
    }
}
