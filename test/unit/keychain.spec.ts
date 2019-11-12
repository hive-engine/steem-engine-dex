/* eslint-disable no-undef */
import { customJson, requestTransfer } from 'common/keychain';

describe('Steem Keychain', () => {
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
        };
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('customJson should return value after promise resolves from callback', async () => {
        const returnValue = await customJson(
            'beggars',
            '1234',
            'Active',
            JSON.stringify({ test: 123 }),
            'Display Name',
        );
        expect(returnValue).toEqual(JSON.stringify({ test: 123 }));
    });

    test('requestTransfer should return value after promise resolves from callback', async () => {
        const returnValue = await requestTransfer('beggars', 'aggroed', '1234.456', 'Testing', 'STEEM');
        expect(returnValue).toEqual('aggroed');
    });
});
