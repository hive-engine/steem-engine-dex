import { getAccount, steemConnectJson, steemConnectJsonId, steemConnectTransfer } from 'common/steem';

import steem from 'steem';

jest.mock('steem');

describe('Steem', () => {

    it('getAccount returns a found user', async () => {
        steem.api.getAccountsAsync.mockReturnValue(Promise.resolve([
            { username: 'beggars' }
        ]));

        const user = await getAccount('beggars');

        expect(user).toEqual({ "username": "beggars" });
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

});
