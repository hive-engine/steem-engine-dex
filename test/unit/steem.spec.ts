/* eslint-disable no-undef */
import { getAccount, steemConnectJson, steemConnectJsonId, steemConnectTransfer } from 'common/steem';
import * as functions from 'common/functions';

import steem from 'steem';

jest.mock('steem');

describe('Steem', () => {
    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('getAccount returns a found user', async () => {
        steem.api.getAccountsAsync.mockReturnValue(Promise.resolve([{ username: 'beggars' }]));

        const user = await getAccount('beggars');

        expect(user).toEqual({ username: 'beggars' });
    });

    test('getAccount cannot find a user', async () => {
        steem.api.getAccountsAsync.mockReturnValue(Promise.resolve([]));

        const user = await getAccount('fsdfsdf');

        expect(user).toBeNull();
    });

    test('getAccount is rejected', async () => {
        steem.api.getAccountsAsync.mockReturnValue(Promise.reject('There was a problem'));

        await expect(getAccount('doesnotexist123')).rejects.toStrictEqual(new Error('There was a problem'));
    });

    test('steemConnectJson calls popupCenter with formatted arguments, active key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJson('beggars', 'active', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%5D&required_auths=%5B%22beggars%22%5D&authority=active&id=ssc-testnet1&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    test('steemConnectJson calls popupCenter with formatted arguments, posting key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJson('beggars', 'posting', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%22beggars%22%5D&id=ssc-testnet1&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    test('steemConnectJsonId calls popupCenter with formatted arguments, active key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJsonId('beggars', 'active', 'test', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%5D&required_auths=%5B%22beggars%22%5D&authority=active&id=test&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    test('steemConnectJsonId calls popupCenter with formatted arguments, posting key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJsonId('beggars', 'posting', 'test', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%22beggars%22%5D&id=test&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    test('steemConnectTransfer creates transaction url for steem connect', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectTransfer('beggars', 'aggroed', '1.000 STEEM', 'Test', Function);

        const url = 'https://steemconnect.com/sign/transfer?&from=beggars&to=aggroed&amount=1.000%20STEEM&memo=Test';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });
});
