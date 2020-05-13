import { ssc } from 'common/ssc';
import { checkTransaction } from 'common/steem-engine';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { steemConnectJson } from 'common/steem';
import { customJson } from 'common/keychain';

import { environment } from 'environment';
import moment from 'moment';
import { ToastService, ToastMessage } from './toast-service';
import { I18N } from 'aurelia-i18n';

type NftFees = 'ENG'; 
type NftType = 'contract' | 'user';

@autoinject()
export class NftService {
    constructor(private se: SteemEngine, private toast: ToastService, private i18n: I18N) {

    }

    /**
     * Load all NFT's or get a users specific NFT values
     * 
     * @param issuer 
     * @param limit 
     * @param offset 
     */
    async loadNfts(issuer: string, limit = 1000, offset = 0): Promise<INft[]> {
        try {
            const params = {} as any;

            if (issuer) {
                params.issuer = issuer;
            }
    
            const nfts = await ssc.find('nft', 'nfts', params, limit, offset, [], false);
    
            for (const nft of nfts) {
                if (nft?.metadata) {
                    nft.metadata = JSON.parse(nft.metadata);
                }
    
                if (nft?.properties) {
                    const finalProperties = [];
    
                    for (const [key, value] of Object.entries(nft.properties) as any) {
                        finalProperties.push({ name: key, ...value });
                    }
    
                    nft.properties = finalProperties;
                }
    
                if (!nft?.groupBy) {
                    nft.groupBy = [];
                }
            }
    
            return nfts;
        } catch (e) {
            return [];
        }
    }

    async loadUserNfts(account: string, limit = 1000, offset = 0): Promise<INft[]> {
        let userOwnedNfts = [];

        try {
            const nfts: any[] = await ssc.find('nft', 'nfts', {  }, limit, offset, [], false);

            for (const nft of nfts) {
                const instances: any[] = await ssc.find('nft', `${nft.symbol}instances`, { account }, limit, offset, [], false);
    
                for (const instance of instances) {
                    instance.symbol = nft.symbol;
                }
    
                if (instances) {
                    userOwnedNfts = [ ...userOwnedNfts, ...instances ];
                }
    
                if (!nft?.groupBy) {
                    nft.groupBy = [];
                }
            }
    
            return userOwnedNfts;
        } catch (e) {
            return userOwnedNfts;
        }
    }

    async loadSellBook(symbol: string, account, limit = 1000, offset = 0): Promise<INftSellBook[]> {
        try {
            const params: any = {};

            if (account) {
                params.account = { $in: [account] };
            }

            const orders: any[] = await ssc.find('nftmarket', `${symbol.toUpperCase()}sellBook`, params, limit, offset, [], false);

            for (const order of orders) {
                order.price = parseFloat(order.price);
                order.timestamp_string = moment.unix(order.timestamp / 1000).format('YYYY-MM-DD HH:mm');
            }

            return orders;
        } catch (e) {
            return [];
        }
    }

    async sellBookExists(symbol: string): Promise<boolean> {
        try {
            const result = await ssc.find('nftmarket', `${symbol.toUpperCase()}sellBook`, { }, 1, 0, [], false);

            return result === null ? false : true;
        } catch (e) {
            return false;
        }
    }

    async loadNft(symbol: string): Promise<INft> {
        try {
            const result = await ssc.findOne('nft', 'nfts', { symbol });

            if (result) {
                if (result?.metadata) {
                    result.metadata = JSON.parse(result.metadata);
                }

                if (result?.properties) {
                    const finalProperties = [];
    
                    for (const [key, value] of Object.entries(result.properties) as any) {
                        finalProperties.push({ name: key, ...value });
                    }
    
                    result.properties = finalProperties;
                }
    
                if (!result?.groupBy) {
                    result.groupBy = [];
                }
            }

            return result;
        } catch (e) {
            return null;
        }
    }

    async loadTradesHistory(symbol: string, limit = 1000, offset = 0): Promise<INftTrade[]> {
        try {
            const history: any[] = await ssc.find('nftmarket', `${symbol.toUpperCase()}tradesHistory`, { }, limit, offset, [], false);

            return history;
        } catch (e) {
            return [];
        }
    }

    async loadOpenInterest(symbol: string, limit = 1000, offset = 0): Promise<INftInterest[]> {
        try {
            const items: any[] = await ssc.find('nftmarket', `${symbol.toUpperCase()}openInterest`, { }, limit, offset, [], false);

            return items;
        } catch (e) {
            return [];
        }
    }

    async loadInstances(symbol: string, account: string, limit = 1000, offset = 0): Promise<INftInstance[]> {
        try {
            const params: any = { };

            if (account) {
                params.account = account;
            }

            const results: any[] = await ssc.find('nft', `${symbol.toUpperCase()}instances`, params, limit, offset, [], false);

            return results;
        } catch (e) {
            return [];
        }
    }

    async loadInstance(symbol: string, id: string): Promise<INftInstance> {
        try {
            const params: any = {
                _id: parseInt(id)
            };

            const result = await ssc.findOne('nft', `${symbol.toUpperCase()}instances`, params) as INftInstance;

            return result;
        } catch (e) {
            return null;
        }
    }

    async loadParams(): Promise<INftParam> {
        try {
            const result = await ssc.findOne('nft', 'params', { });

            for (const [key, value] of Object.entries(result) as any) {
                if (!Object.keys(value)) {
                    result[key] = parseFloat(value);
                }
            }
    
            return result;
        } catch(e) {
            return null;
        }
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

    async transfer(symbol: string, id: string, to: string, toType?: NftType) {
        return new Promise((resolve) => {
            const transactionData = {
                contractName: 'nft',
                contractAction: 'transfer',
                contractPayload: {
                    to: to,
                    toType: toType,
                    nfts: [
                        { symbol: symbol, ids: [`${id}`] }
                    ]
                }
            };
    
            if (window.steem_keychain) {
                return resolve(customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(transactionData), `Transfer NFT Token ${symbol} ${id}`));
            } else {
                steemConnectJson(this.se.getUser(), 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

    async updatePropertyDefinition(symbol: string, property: any) {
        return new Promise((resolve) => {
            const transactionData = {
                contractName: 'nft',
                contractAction: 'updatePropertyDefinition',
                contractPayload: {
                    symbol,
                    name: property.name
                }
            };

            if (property.newName !== property.name) {
                transactionData.contractPayload = {
                    ...transactionData.contractPayload,
                    ...{
                        newName: property.newName
                    }
                };
            }

            if (property.newType !== property.type) {
                transactionData.contractPayload = {
                    ...transactionData.contractPayload,
                    ...{
                        type: property.newType
                    }
                };
            }

            if (property.newIsReadOnly !== property.isReadOnly) {
                transactionData.contractPayload = {
                    ...transactionData.contractPayload,
                    ...{
                        isReadOnly: property.newIsReadOnly
                    }
                };
            }            

            if (window.steem_keychain) {
                window.steem_keychain.requestCustomJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(transactionData), 'Update Property Definition', async (response) => {

                    if (response.success && response.result) {
                        try {
                            await checkTransaction(response.result.id, 3);

                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('updatePropertyDefinitionSuccess', {
                                symbol,
                                ns: 'notifications'
                            });

                            this.toast.success(toast);

                            resolve(true);
                        } catch (e) {
                            // Show error toastr: 'An error occurred attempting to unstake tokens: ' + tx.error
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: e
                            });

                            this.toast.error(toast);

                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                });                
            } else {
                steemConnectJson(this.se.getUser(), 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

    async changeOwnership(symbol: string, user: string) {
        return new Promise((resolve) => {
            const transactionData = {
                contractName: 'nft',
                contractAction: 'transferOwnership',
                contractPayload: {
                    to: user,
                    symbol: symbol
                }
            };
    
            if (window.steem_keychain) {
                return resolve(customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(transactionData), `Change NFT Ownership`));
            } else {
                steemConnectJson(this.se.getUser(), 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

    async burn(symbol: string, id: string) {
        return new Promise((resolve) => {
            const transactionData = {
                contractName: 'nft',
                contractAction: 'burn',
                contractPayload: {
                    nfts: [
                        { symbol: symbol, ids: [`${id}`] }
                    ]
                }
            };
    
            if (window.steem_keychain) {
                return resolve(customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(transactionData), `Burn NFT Token ${symbol} ${id}`));
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
                try {
                    window.steem_keychain.requestCustomJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(payloads), `Add NFT Properties ${symbol}`, async (response) => {

                        if (response.success && response.result) {
                            try {                                
                                // checktransaction takes very long time for this call
                                //await checkTransaction(response.result.id, 3);
                                await new Promise(resolve => setTimeout(resolve, 5000))

                                const toast = new ToastMessage();

                                toast.message = this.i18n.tr('nftAddPropertiesSuccess', {
                                    symbol,
                                    ns: 'notifications'
                                });

                                this.toast.success(toast);

                                resolve(true);
                            } catch (e) {
                                // Show error toastr: 'An error occurred attempting to unstake tokens: ' + tx.error
                                const toast = new ToastMessage();

                                toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                    ns: 'errors',
                                    error: e
                                });

                                this.toast.error(toast);

                                resolve(false);
                            }
                        } else {
                            resolve(false);
                        }
                    });         
                } catch (e) {
                    /* istanbul ignore next */
                    const toast = new ToastMessage();

                    /* istanbul ignore next */
                    toast.message = this.i18n.tr('nftAddPropertiesFailed', {
                        ns: 'notifications'
                    });

                    /* istanbul ignore next */
                    this.toast.error(toast);

                    /* istanbul ignore next */
                    resolve(false);
                }
                
            } else {
                steemConnectJson(this.se.getUser(), 'active', payloads, () => {
                    resolve(true);
                });
            }
        });
    }
}
