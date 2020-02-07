import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { EditTokenModal } from 'modals/wallet/issuers/edit-token';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';
import styles from './token-info.module.css';

@autoinject()
export class TokenInfoModal {
    private token: any;
    private isNft: boolean;
    private styles = styles;

    constructor(private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;    
    }

    async activate(token) {
        this.token = token;  
        
        if (!token?.token) {
            this.token.token = {
                circulatingSupply: token.circulatingSupply,
                issuer: token.issuer,
                maxSupply: token.maxSupply,
                metadata: token.metadata,
                name: token.name,
                supply: token.supply
            };
        }

        this.isNft = this.token && this.token.authorizedIssuingAccounts ? true : false;

        console.log(this.token);
    }

    editToken(token) {
        this.controller.cancel();

        this.dialogService
            .open({ viewModel: EditTokenModal, model: token })
            .whenClosed(response => {
                //console.log(response);
            });
    }
}
