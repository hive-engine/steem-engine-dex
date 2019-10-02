import { Container } from 'aurelia-framework';
import { Store } from 'aurelia-store';
import { State } from './state';

const store: Store<State> = Container.instance.get(Store) as Store<State>;

export async function getStateOnce(): Promise<State> {
    let subscription;
    return new Promise(async (resolve) => {
        subscription = await store.state.subscribe((innerState) => {
            resolve(innerState);
        }).unsubscribe();
    });
}

export const getCurrentState = () => (store as any)._state.getValue();

export default store;
