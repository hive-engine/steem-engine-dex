import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { steemConnectJsonId, steemConnectJson, getAccount, steemConnectTransfer } from 'common/steem';
import { customJson, requestTransfer } from 'common/keychain';

import { environment } from 'environment';

type NftFees = 'ENG' | 'PAL';
type NftType = 'contract' | 'user';

@autoinject()
export class NftService {
    constructor(private se: SteemEngine) {

    }

    async issue(symbol: string, feeSymbol: string, to: string, toType?: NftType, lockTokens?: any, properties?: any) {
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
            return customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(transactionData), `Issue NFT Token ${symbol}`);
        }
    }
}
