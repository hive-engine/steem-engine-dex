jest.mock('sscjs');
jest.mock('steem');
jest.mock('izitoast');

import { getUserOpenOrders } from 'common/market';
import { ssc } from 'common/ssc';

describe('Market', () => {

    it('getUserOpenOrders gets user open orders', async () => {
        ssc.find = jest.fn().mockImplementation((table, type) => {
            if (type === 'buyBook') {

            } else if (type === 'sellBook') {
                
            }
        });
        const orders = await getUserOpenOrders('beggars');
    });

});
