import { NftService } from './../../services/nft-service';
import { environment } from 'environment';
import { Redirect } from 'aurelia-router';
import { pluck } from 'rxjs/operators';
import { DialogService } from 'aurelia-dialog';
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
    private tokenProperties: { name: string; type: string; isReadOnly: boolean; editMode: boolean, newName: string, newType: string, newIsReadOnly: boolean}[] = [];
    private loading = false;

    constructor(private se: SteemEngine, private nftService: NftService, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate({ symbol }) {
        try {
            await dispatchify(getNft)(symbol);
        } catch {
            return new Redirect('/wallet');
        }
    }

    bind() {
        console.log(this.token);
    }

    addTokenPropertyRow() {
        this.tokenProperties.push({ name: '', type: 'string', isReadOnly: false, editMode: false, newName: '', newType: '', newIsReadOnly: false });
    }

    removeProperty($index) {
        this.tokenProperties.splice($index, 1);
    }

    async saveChanges() {
        this.loading = true;

        const response = await this.nftService.addProperties(this.token.symbol, this.tokenProperties);

        this.loading = false; 

        if (response !== false)
            window.location.reload();
    }

    propertyEditMode(property, editModeVal) {
        property.editMode = editModeVal;
                
        property.newName = property.name;       
        property.newType = property.type;        
        property.newIsReadOnly = property.isReadOnly;
    }

    isEditable(property) {
        return this.token.supply == 0 && !this.token.groupBy.find(x => x === property.name);
    }

    async updatePropertyDefinition(property) {
        this.loading = true;

        if (property.name !== property.newName) {
            let nameExists = this.token.properties.find(x => x.name === property.newName);
            if (nameExists) {
                window.alert('Name is already in use for another property');
                this.loading = false;

                return;
            }
        }

        const response = await this.nftService.updatePropertyDefinition(this.token.symbol, property);

        this.loading = false;

        if (response !== false)
            window.location.reload();        
    }

    stateChanged(newState) {
        this.token = { ...newState };

        this.tokenProperties.map((property) => {
            (property as any).$prop = property;

            return property;
        })
    }
    
}
