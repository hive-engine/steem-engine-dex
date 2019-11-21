import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import styles from './token-info.module.css';

@autoinject()
export class TokenInfoModal {
    private token: any;
    private styles = styles;

    constructor(private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue) {
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
    }
}
