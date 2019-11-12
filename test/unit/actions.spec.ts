/* eslint-disable no-undef */
import { loading, login, logout, setAccount, setTokens } from 'store/actions';

describe('Actions', () => {

    beforeEach(() => {
        fetchMock.resetMocks();
        jest.clearAllMocks();
    });

    it('loading action should set to true', () => {
        const result = loading({loading: false} as any, true);

        expect(result).toMatchObject({loading: true});
    });
    
    it('loading action should set to false', () => {
        const result = loading({loading: true} as any, false);

        expect(result).toMatchObject({loading: false});
    });

    it('login action should store credentials', () => {
        const result = login({account: { name: '' }} as any, 'Crouton');

        expect(result).toMatchObject({account: { name: 'Crouton' }});
    });

    it('logout action should empty state values', () => {
        const result = logout({ account: {}, loggedIn: true } as any);

        expect(result).toMatchObject({
            account: { 
                name: '', 
                token: {}, 
                account: {}, 
                balances: [], 
                scotTokens: [], 
                pendingUnstakes: [] 
            }, 
            loggedIn: false});
    });

    it('setAccount action should merge in values', () => {
        const result = setAccount({ account: {} } as any, { name: 'beggars' });

        expect(result).toMatchObject({
            account: { 
                name: 'beggars'
            }});
    });

    it('setTokens should set tokens array', () => {
        const result = setTokens({ tokens: [] } as any, ['aggroed', 'beggars']);

        expect(result).toMatchObject({
            tokens: ['aggroed', 'beggars']
        });
    });

});
