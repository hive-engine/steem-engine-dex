import { getAccount, steemConnectJson, steemConnectJsonId, steemConnectTransfer } from 'common/steem';
import * as functions from 'common/functions';

import steem from 'steem';

jest.mock('steem');

describe('Steem', () => {
    it('getAccount returns a found user', async () => {
        steem.api.getAccountsAsync.mockReturnValue(Promise.resolve([{ username: 'beggars' }]));

        const user = await getAccount('beggars');

        expect(user).toEqual({ username: 'beggars' });
    });

    it('getAccount cannot find a user', async () => {
        steem.api.getAccountsAsync.mockReturnValue(Promise.resolve([]));

        const user = await getAccount('fsdfsdf');

        expect(user).toBeNull();
    });

    it('getAccount is rejected', async () => {
        try {
            steem.api.getAccountsAsync.mockReturnValue(Promise.reject('There was a problem'));

            const user = await getAccount('doesnotexist123');
        } catch (e) {
            expect(e).toEqual(new Error('There was a problem'));
        }
    });

    it('steemConnectJson calls popupCenter with formatted arguments, active key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJson('beggars', 'active', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%5D&required_auths=%5B%22beggars%22%5D&id=ssc-mainnet1&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    it('steemConnectJson calls popupCenter with formatted arguments, posting key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJson('beggars', 'posting', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%5D&required_auths=%5B%22beggars%22%5D&id=ssc-mainnet1&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    it('steemConnectJsonId calls popupCenter with formatted arguments, active key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJsonId('beggars', 'active', 'test', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%5D&required_auths=%5B%22beggars%22%5D&id=ssc-mainnet1&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    it('steemConnectJsonId calls popupCenter with formatted arguments, posting key and url', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectJsonId('beggars', 'posting', 'test', { value: 'aggroed' }, Function);

        const url =
            'https://steemconnect.com/sign/custom-json?required_posting_auths=%5B%5D&required_auths=%5B%22beggars%22%5D&id=ssc-mainnet1&json=%7B%22value%22:%22aggroed%22%7D';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });

    it('steemConnectTransfer creates transaction url for steem connect', () => {
        window.open = jest.fn();

        const spy = jest.spyOn(functions, 'popupCenter');

        steemConnectTransfer('beggars', 'aggroed', '1.000 STEEM', 'Test', Function);

        const url = 'https://steemconnect.com/sign/transfer?&from=beggars&to=aggroed&amount=1.000%20STEEM&memo=Test';

        expect(spy).toHaveBeenCalledWith(url, 'steemconnect', 500, 560);
    });
});
