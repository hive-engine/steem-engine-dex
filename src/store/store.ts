import { Container } from 'aurelia-framework';
import { Store } from 'aurelia-store';
import { State } from './state';

const store: Store<State> = Container.instance.get(Store);

export async function getStateOnce(): Promise<State> {
    return new Promise(async (resolve) => {
        const subscription = await store.state.subscribe((innerState) => {
            subscription.unsubscribe();

            resolve(innerState);
        });
    });
}

export const getCurrentState = () => (store as any)._state.getValue();

export default store;
