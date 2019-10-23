import { loading, login } from 'store/actions';

describe('Actions', () => {

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

});
