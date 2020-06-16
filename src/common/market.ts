import { Container } from 'aurelia-framework';
import { log } from './../services/log';
import { environment } from 'environment';
import { ToastMessage, ToastService } from 'services/toast-service';

import moment from 'moment';
import { ssc } from './ssc';
import { I18N } from 'aurelia-i18n';
import { checkTransaction } from './steem-engine';
import { steemConnectJson } from './steem';

const ALLOWED_MARKET_ACTIONS = ['buy', 'sell'];

const toastService: ToastService = Container.instance.get(ToastService);
const i18n: I18N = Container.instance.get(I18N);

export async function getUserOpenOrders(account: string = null) {
    try {
        let buyOrders = await ssc.find('market', 'buyBook', { account: account }, 100, 0, [{ index: '_id', descending: true }], false);
        let sellOrders = await ssc.find('market', 'sellBook', { account: account }, 100, 0, [{ index: '_id', descending: true }], false);

        buyOrders = buyOrders.map(o => {
            o.type = 'buy';
            o.total = o.price * o.quantity;
            o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
            o.checked = false;
            return o;
        });

        sellOrders = sellOrders.map(o => {
            o.type = 'sell';
            o.total = o.price * o.quantity;
            o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
            o.checked = false;
            return o;
        });

        const combinedOrders = [...buyOrders, ...sellOrders]
            .sort((a, b) => b.timestamp - a.timestamp);

        return combinedOrders;
    } catch (e) {
        const toast = new ToastMessage();

        toast.message = i18n.tr(e);

        toastService.error(toast);

        return [];
    }
}


export async function sendMarketOrder(username: string, type: string, symbol: string, quantity: string, price: string) {
    return new Promise((resolve, reject) => {
        if (!ALLOWED_MARKET_ACTIONS.includes(type)) {
            log.error(`Invalid order type: ${type}`);
            return reject(`Invalid order type: ${type}`);
        }

        const transaction_data = {
            "contractName": "market",
            "contractAction": `${type}`,
            "contractPayload": {
                "symbol": `${symbol}`,
                "quantity": `${quantity}`,
                "price": `${price}`
            }
        };

        log.debug(`Broadcasting cancel order: ${JSON.stringify(transaction_data)}`);

        if (window.steem_keychain) {
            window.steem_keychain.requestCustomJson(username, environment.chainId, 'Active', JSON.stringify(transaction_data), `${type.toUpperCase()} Order`, async (response) => {
                if (response.success && response.result) {
                    try {
                        const tx = await checkTransaction(response.result.id, 3);

                        const toast = new ToastMessage();

                        toast.message = i18n.tr('orderSuccess', {
                            ns: 'notifications',
                            type,
                            symbol
                        });

                        toastService.success(toast);

                        resolve(tx);
                    } catch (e) {
                        const toast = new ToastMessage();

                        toast.message = i18n.tr('orderError', {
                            ns: 'notifications',
                            type,
                            symbol,
                            error: e
                        });

                        toastService.error(toast);

                        resolve(false);
                    }
                } else {
                    resolve(response);
                }
            });
        } else {
            steemConnectJson(username, 'active', transaction_data);
        }
    });
}

export async function cancelMarketOrder(username: string, type: string, orderId: string, symbol: string) {
    return new Promise((resolve, reject) => {
        if (!ALLOWED_MARKET_ACTIONS.includes(type)) {
            log.error(`Invalid order type: ${type}`);
            return reject(`Invalid order type: ${type}`);
        }

        const transaction_data = {
            "contractName": "market",
            "contractAction": "cancel",
            "contractPayload": {
                "type": type,
                "id": orderId
            }
        };

        log.debug(`Broadcasting cancel order: ${JSON.stringify(transaction_data)}`);

        if (window.steem_keychain) {
            window.steem_keychain.requestCustomJson(username, environment.chainId, 'Active', JSON.stringify(transaction_data), `Cancel ${type.toUpperCase()} Order`, async (response) => {
                if (response.success && response.result) {
                    try {
                        const toastWait = new ToastMessage();
                        toastWait.message = i18n.tr('orderCancelWait', {
                            ns: 'notifications',
                            type,
                            symbol
                        });

                        toastService.success(toastWait);

                        const transaction = await checkTransaction(response.result.id, 3);

                        const toast = new ToastMessage();

                        toast.message = i18n.tr('orderCanceled', {
                            ns: 'notifications',
                            type,
                            symbol
                        });

                        toastService.success(toast);

                        resolve(transaction);
                    } catch (e) {
                        const toast = new ToastMessage();

                        toast.message = i18n.tr('errorCancelOrder', {
                            ns: 'notifications',
                            type,
                            error: e
                        });

                        toastService.error(toast);

                        resolve(false);
                    }
                } else {
                    resolve(response);
                }
            });
        } else {
            steemConnectJson(username, 'active', transaction_data, () => {

            });
        }
    });
}
