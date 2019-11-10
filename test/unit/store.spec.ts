import { Store } from 'aurelia-store';
import { Container } from 'aurelia-framework';
import { createStore } from './helpers';

const container: Container = new Container().makeGlobal();
const store: any = createStore({username: 'aggroed', property: 'something'});
container.registerInstance(Store, store);

store.registerAction('test', (state: any, username: string) => {
    const newState = { ...state };

    newState.username = username;

    return newState;
});

import { getStateOnce, getCurrentState } from 'store/store';

describe('Store', () => {
    test('gets state once', async () => {
        const state: any = await getStateOnce();

        expect(state).toEqual({username: 'aggroed', property: 'something'});

        store.dispatch('test', 'beggars');

        expect(state.username).toBe('aggroed');
    });

    test('get current state object directly', async () => {
        await store.dispatch('test', 'aggroed');

        expect(getCurrentState()).toEqual({username: 'aggroed', property: 'something'});
    })
});
