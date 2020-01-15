import { checkTransaction } from 'common/steem-engine';
import { sleep } from 'common/functions';
import { loading } from 'store/actions';
import { dispatchify } from 'aurelia-store';
import { NftService } from './../../services/nft-service';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class NftTransferModal {
    private token;
    private transaction;
    private errors: string[] = [];

    constructor(private controller: DialogController, private nftService: NftService) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(token) {
        this.token = token;
        console.log(token);
    }

    async transfer() {
        try {
            const transfer = this.nftService.transfer(this.token.symbol, this.token._id, this.transaction.id, this.transaction.toType) as any;

            console.log(transfer);

            if (transfer.success) {
                try {
                    const verify = await checkTransaction(transfer.result.id, 3);
                    
                    if (verify?.errors) {
                        this.errors = verify.errors;
                    } else {
                        await sleep(3200);
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            dispatchify(loading)(false);
        } catch {
            dispatchify(loading)(false);
        }
    }
}
