import { customJson } from 'common/keychain';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import styles from './nft-enable.module.css';

import { environment } from 'environment';

@autoinject()

export class NftEnableModal {
    private styles = styles;
    private token;
    private properties: string[] = [];

    constructor(private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;    
    }

    async activate(token) {
        this.token = token;
    }

    async setGroupBy() {
        const payload = {
            contractName: 'nft',
            contractAction: 'setGroupBy',
            contractPayload: {
                symbol: this.token.symbol,
                properties: this.properties
            }
        };

        if (window.steem_keychain) {
            const response = await customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(payload), `Set Group By Properties`);

            if (response.success) {
                this.controller.ok();
            }
        }
    }

    addPropertyRow() {
        this.properties.push('');
    }

    removeProperty($index) {
        this.properties.splice($index, 1);
    }
}
