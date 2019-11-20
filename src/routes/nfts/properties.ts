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
    private state: State;
    private token;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate({ symbol }) {
        try {
            await dispatchify(getNft)(symbol);
        } catch {
            return new Redirect('/wallet');
        }
    }

    saveChanges() {
        
    }

    stateChanged(newState) {
        this.token = { ...newState };
    }
    
}
