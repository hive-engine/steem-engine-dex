/* eslint-disable no-undef */
import { loading, login, logout, setAccount, setTokens } from 'store/actions';

describe('Actions', () => {
    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('loading action should set to true', () => {
        const result = loading({ loading: false } as any, true);

        expect(result).toMatchObject({ loading: true });
    });

    test('loading action should set to false', () => {
        const result = loading({ loading: true } as any, false);

        expect(result).toMatchObject({ loading: false });
    });

    test('login action should store credentials', () => {
        const result = login({ account: { name: '' } } as any, 'Crouton');

        expect(result).toMatchObject({ account: { name: 'Crouton' } });
    });

    test('logout action should empty state values', () => {
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
            loggedIn: false
        });
    });

    test('setAccount action should merge in values', () => {
        const result = setAccount({ account: {} } as any, { name: 'beggars' });

        expect(result).toMatchObject({
            account: {
                name: 'beggars'
            }
        });
    });

    test('setTokens should set tokens array', () => {
        const result = setTokens({ tokens: [] } as any, ['aggroed', 'beggars']);

        expect(result).toMatchObject({
            tokens: ['aggroed', 'beggars']
        });
    });

});
