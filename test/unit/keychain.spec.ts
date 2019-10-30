import { customJson, requestTransfer } from 'common/keychain';

describe('Steem Keychain', () => {

    beforeEach(() => {
        (global as any).steem_keychain = {
            requestCustomJson: jest.fn().mockImplementation((username, jsonId, keyType, jsonData, displayName, callback) => {
                callback(jsonData);
            }),
            requestTransfer: jest.fn().mockImplementation((username, account, amount, memo, currency, callback) => {
                callback(account);
            })
        }
    });

    it('customJson should return value after promise resolves from callback', async () => {
        const returnValue = await customJson('beggars', '1234', 'Active', JSON.stringify({ test: 123 }), 'Display Name');
        expect(returnValue).toEqual(JSON.stringify({ test: 123 }));
    });

    it('customJson should return value after promise resolves from callback', async () => {
        const returnValue = await customJson('beggars', '1234', 'Active', JSON.stringify({ test: 123 }), 'Display Name');
        
        expect((global as any).steem_keychain.requestCustomJson)
            .toHaveBeenCalledWith('beggars', '1234', 'Active', JSON.stringify({ test: 123 }), 'Display Name', expect.any(Function));
    });

    it('requestTransfer should return value after promise resolves from callback', async () => {
        const returnValue = await requestTransfer('beggars', 'aggroed', '1234.456', 'Testing', 'STEEM');
        expect(returnValue).toEqual('aggroed');
    });

    it('requestTransfer should return value after promise resolves from callback', async () => {
        const returnValue = await requestTransfer('beggars', 'aggroed', '1234.456', 'Testing', 'STEEM');
        
        expect((global as any).steem_keychain.requestTransfer)
            .toHaveBeenCalledWith('beggars', 'aggroed', '1234.456', 'Testing', 'STEEM', expect.any(Function));
    });
});
