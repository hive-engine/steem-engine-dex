import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { steemConnectJson } from 'common/steem';
import { customJson } from 'common/keychain';

import { environment } from 'environment';

type NftFees = 'ENG' | 'PAL';
type NftType = 'contract' | 'user';

@autoinject()
export class NftService {
    constructor(private se: SteemEngine) {

    }

    async issue(symbol: string, feeSymbol: string, to: string, toType?: NftType, lockTokens?: any, properties?: any) {
        return new Promise((resolve) => {
            const transactionData = {
                contractName: 'nft',
                contractAction: 'issue',
                contractPayload: {
                    'symbol': symbol,
                    'to': to,
                    'feeSymbol': feeSymbol
                }
            };
    
            if (lockTokens && Object.keys(lockTokens).length) {
                transactionData.contractPayload = {
                    ...transactionData.contractPayload,
                    ...{
                        lockTokens: lockTokens
                    }
                };
            }
    
            if (properties && Object.keys(properties).length) {
                transactionData.contractPayload = {
                    ...transactionData.contractPayload,
                    ...{
                        properties: properties
                    }
                };
            }
    
            if (window.steem_keychain) {
                return resolve(customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(transactionData), `Issue NFT Token ${symbol}`));
            } else {
                steemConnectJson(this.se.getUser(), 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

    async addProperties(symbol: string, properties: any) {
        return new Promise(resolve => {
            const payloads = properties.reduce((acc, value) => {
                acc.push({
                    contractName: 'nft',
                    contractAction: 'addProperty',
                    contractPayload: {
                        symbol,
                        name: value.name,
                        type: value.type,
                        isReadOnly: value.isReadOnly
                    }
                });
    
                return acc;
            }, []);
    
            if (window.steem_keychain) {
                return resolve(customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(payloads), `Add NFT Properties ${symbol}`));
            } else {
                steemConnectJson(this.se.getUser(), 'active', payloads, () => {
                    resolve(true);
                });
            }
        });
    }
}
