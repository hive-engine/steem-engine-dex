import { NftService } from './../../services/nft-service';
import { environment } from 'environment';
import { Redirect } from 'aurelia-router';
import { pluck } from 'rxjs/operators';
import { NftPropertiesModal } from '../../modals/nft/nft-properties';
import { DialogService } from 'aurelia-dialog';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';


import { connectTo, dispatchify } from 'aurelia-store';
import { getNft } from 'store/actions';

import styles from './properties.module.css';

@autoinject()
@connectTo((store) => store.state.pipe(pluck('nft')))
export class PropertiesNft {
    private styles = styles;

    private environment = environment;

    private state: State;
    private token;
    private tokenProperties: {name: string; type: string; value: string | number | boolean; isReadOnly: boolean;}[] = [];

    constructor(private se: SteemEngine, private nftService: NftService, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate({ symbol }) {
        try {
            await dispatchify(getNft)(symbol);
        } catch {
            return new Redirect('/wallet');
        }
    }

    addTokenPropertyRow() {
        this.tokenProperties.push({ name: '', type: 'string', value: '', isReadOnly: false });
    }

    removeProperty($index) {
        this.tokenProperties.splice($index, 1);
    }

    async saveChanges() {
        const request = await this.nftService.addProperties(this.token.symbol, this.tokenProperties);
    }

    stateChanged(newState) {
        this.token = { ...newState };

        this.tokenProperties.map((property) => {
            (property as any).$prop = property;

            return property;
        })
    }
    
}
