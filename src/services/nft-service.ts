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

    issue(symbol: string, to: string, from: NftFees, fromType?: NftType, toType?: NftType, lockTokens?: any, properties?: any) {
        const transactionData = {
            contractName: 'nft',
            contractAction: 'issue',
            contractPayload: {
                'symbol': symbol,
                'to': to,
                'feeSymbol': symbol
            }
        };

        if (fromType === 'user' && toType === 'contract') {
            transactionData.contractPayload = {
                ...transactionData.contractPayload,
                ...{
                    toType: 'contract',
                    feeSymbol: symbol
                }
            };
        }

        if (lockTokens) {
            transactionData.contractPayload = {
                ...transactionData.contractPayload,
                ...{
                    toType: 'contract',
                    feeSymbol: symbol,
                    lockTokens: lockTokens
                }
            };
        }

        if (properties) {
            transactionData.contractPayload = {
                ...transactionData.contractPayload,
                ...{
                    toType: 'contract',
                    feeSymbol: symbol,
                    properties: properties
                }
            };
        }

        if (window.steem_keychain) {
            customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(transactionData), `Issue NFT Token ${symbol}`, async (response) => {

            });
        }
    }
}
