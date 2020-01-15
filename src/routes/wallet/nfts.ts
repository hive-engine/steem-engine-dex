import { NftTransferModal } from './../../modals/nft/nft-transfer';
import { NftPropertiesModal } from './../../modals/nft/nft-properties';
import { DialogService } from 'aurelia-dialog';
import { State } from 'store/state';
import { connectTo, dispatchify } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { getUserNfts } from 'store/actions';

@autoinject()
@connectTo()
export class MyNfts {
    private state: State;
    private loading = false;
    
    constructor(private se: SteemEngine, private dialogService: DialogService) {

    }

    async activate() {
        await dispatchify(getUserNfts)();
    }

    showNftProperties(token) {
        this.dialogService.open({ viewModel: NftPropertiesModal, model: token }).whenClosed(response => {
            //console.log(response);
        });
    }

    transferNft(token) {
        this.dialogService.open({ viewModel: NftTransferModal, model: token }).whenClosed(response => {

        });
    }
}
