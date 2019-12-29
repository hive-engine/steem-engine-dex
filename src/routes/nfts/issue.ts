import { query } from 'common/apollo';
import { NftService } from './../../services/nft-service';
import { DialogService } from 'aurelia-dialog';
import { SteemEngine } from './../../services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { State } from './../../store/state';
import { connectTo } from 'aurelia-store';

import { environment } from 'environment';

import styles from './issue.module.css';

@autoinject()
@connectTo()
export class Issue {
    private styles = styles;
    private environment = environment;
    private state: State;
    private symbol: string;
    private token;

    private issuingTo: string;
    private feeSymbol = environment.nativeToken;
    private tokenProperties: {name: string; type: string; value: string | number | boolean;}[] = [];
    private lockedTokens: {name: string; amount: string;}[] = [];

    constructor(private se: SteemEngine, private nftService: NftService, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate({ symbol }) {
        if (symbol) {
            const response = await query(`query { nft(symbol: "${symbol}") { properties { isReadOnly, name, type }}}`);

            if (response?.data?.nft) {
                this.token = response.data.nft;
            }

            this.symbol = symbol;
        }
    }

    propertyTypeSelected(property) {
        property.type = property.$prop.type;
        delete property.$prop;

        console.log(property);
    }

    addTokenPropertyRow() {
        this.tokenProperties.push({ name: '', type: 'string', value: '' });
    }

    addLockedTokenPropertyRow() {
        this.lockedTokens.push({ name: '', amount: '' });
    }

    removeProperty($index) {
        this.tokenProperties.splice($index, 1);
    }

    removeLockedToken($index) {
        this.lockedTokens.splice($index, 1);
    }

    async issueNft() {
        const lockTokens = this.lockedTokens.reduce((acc, value) => {
            return Object.assign(acc, {
                [value.name]: value.amount
            })
        }, {});

        const tokenProperties = this.tokenProperties.reduce((acc, value) => {
            let coercedValue = value.value;
            
            if (value.type === 'boolean') {
                coercedValue = !!value.value;
            }

            if (value.type === 'number') {
                coercedValue = +value.value;
            }

            return Object.assign(acc, {
                [value.name]: coercedValue
            })
        }, {});

        const issuance = await this.nftService.issue(this.symbol, this.feeSymbol, this.issuingTo, 'user', lockTokens, tokenProperties);

        if (issuance.success) {
            
        }

        console.log(issuance);
    }
}
