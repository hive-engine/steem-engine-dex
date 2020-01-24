import { sleep } from 'common/functions';
import { loading } from 'store/actions';
import { AppRouter } from 'aurelia-router';
import { checkTransaction } from 'common/steem-engine';
import { query } from 'common/apollo';
import { NftService } from './../../services/nft-service';
import { DialogService } from 'aurelia-dialog';
import { SteemEngine } from './../../services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { connectTo, dispatchify } from 'aurelia-store';

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

    private errors: string[] = [];

    constructor(private se: SteemEngine, private nftService: NftService, private taskQueue: TaskQueue, private dialogService: DialogService, private router: AppRouter) {}

    async canActivate({ symbol }) {
        if (symbol) {
            const response = await this.nftService.loadNft(symbol);

            if (response) {
                this.token = response;
            }

            this.symbol = symbol;
        }
    }

    propertyTypeSelected(property) {
        this.taskQueue.queueMicroTask(() => {
            property.type = property.$prop.type;
            property.name = property.$prop.name;
    
            delete property.$prop;
        });
    }

    addTokenPropertyRow() {
        if (this.tokenProperties.length === 0) {
            this.tokenProperties.push({ name: this.token.properties[0].name, type: 'string', value: '' });
        } else {
            this.tokenProperties.push({ name: '', type: 'string', value: '' });
        }
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
        this.errors = [];
        dispatchify(loading)(true);
        
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

        try {
            const issuance = await this.nftService.issue(this.symbol, this.feeSymbol, this.issuingTo, 'user', lockTokens, tokenProperties) as any;

            if (issuance.success) {
                try {
                    const verify = await checkTransaction(issuance.result.id, 3);
                    
                    if (verify?.errors) {
                        this.errors = verify.errors;
                    } else {
                        await sleep(3200);
                        this.router.navigateToRoute('nft', { symbol: this.symbol });
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
