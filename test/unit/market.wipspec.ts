import { getUserOpenOrders, sendMarketOrder } from 'common/market';

jest.mock('sscjs');
jest.mock('steem');
jest.mock('izitoast');

describe('Market', () => {

    it('getUserOpenOrders gets user open orders', async () => {
        try {
            const orders = await getUserOpenOrders('beggars');
        } catch (e) {

        }
    });

});
