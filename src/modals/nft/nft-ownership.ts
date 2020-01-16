import { checkTransaction } from 'common/steem-engine';
import { sleep } from 'common/functions';
import { loading } from 'store/actions';
import { dispatchify } from 'aurelia-store';
import { NftService } from './../../services/nft-service';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class NftOwnershipModal {
    private symbol;
    private user;
    private errors: string[] = [];

    constructor(private controller: DialogController, private nftService: NftService) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(symbol) {
        this.symbol = symbol;
    }

    async changeOwnership() {
        dispatchify(loading)(true);

        try {
            const transfer = await this.nftService.changeOwnership(this.symbol, this.user.toLowerCase()) as any;

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
