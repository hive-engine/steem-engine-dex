/* eslint-disable no-undef */
jest.mock('sscjs');
jest.mock('steem');
jest.mock('izitoast');

jest.mock('moment', () => {
    return {
        default: {
            unix: jest.fn().mockImplementation(() => {
                return {
                    format: jest.fn()
                }
            })
        }
    }
});

import { getUserOpenOrders, sendMarketOrder, cancelMarketOrder } from 'common/market';
import { ssc } from 'common/ssc';

describe('Market', () => {

    beforeEach(() => {
        (window as any).steem_keychain = {
            requestCustomJson: jest
                .fn()
                .mockImplementation((username, jsonId, keyType, jsonData, displayName, callback) => {
                    callback(jsonData);
                }),
            requestTransfer: jest.fn().mockImplementation((username, account, amount, memo, currency, callback) => {
                callback(account);
            }),
            requestVerifyKey: jest.fn().mockImplementation((username, memo, type, callback) => {
                callback(username);
            }),
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
        fetchMock.resetMocks();
    });

    test('getUserOpenOrders gets user open orders', async () => {
        ssc.find = jest.fn().mockImplementation((table, type) => {
            if (type === 'buyBook') {
                return Promise.resolve([
                    { price: 999, quantity: 2, timestamp: '2019-11-12 12:01:42' },
                    { price: 5345, quantity: 520, timestamp: '2019-11-12 12:01:42' },
                    { price: 1234545, quantity: 50, timestamp: '2019-11-12 12:01:42' }
                ]);
            } else if (type === 'sellBook') {
                return Promise.resolve([
                    { price: 90859485, quantity: 2, timestamp: '2019-11-12 12:01:42' },
                    { price: 454, quantity: 520, timestamp: '2019-11-12 12:01:42' },
                    { price: 666, quantity: 50, timestamp: '2019-11-12 12:01:42' }
                ]);
            }
        });

        const orders = await getUserOpenOrders('beggars');

        expect(orders).toHaveLength(6);
    });

    test('sendmarket order', async () => {
        await sendMarketOrder('beggars', 'sell', 'ENG', '500', '0.90');

        expect(window.steem_keychain.requestCustomJson).toHaveBeenCalledWith('beggars', 'ssc-mainnet1', 'Active', expect.stringContaining('contractAction'), 'SELL Order', expect.any(Function));
    });

    test('sendmarket order invalid action', async () => {
        await expect(sendMarketOrder('beggars', 'invalid', 'ENG', '500', '0.90')).rejects.toBe('Invalid order type: invalid');
    });

    test('cancelmarket order', async () => {
        cancelMarketOrder('beggars', 'sell', '898fdsfkjk', 'ENG');

        expect(window.steem_keychain.requestCustomJson).toHaveBeenCalledWith('beggars', 'ssc-mainnet1', 'Active', expect.stringContaining('cancel'), 'Cancel SELL Order', expect.any(Function));
    });

    test('cancelmarket order invalid action', async () => {
        await expect(cancelMarketOrder('beggars', 'invalid', '898fdsfkjk', 'ENG')).rejects.toBe('Invalid order type: invalid');
    });

});
