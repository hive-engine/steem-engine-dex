import { Container } from 'aurelia-framework';
import { Store } from 'aurelia-store';
import { first } from 'rxjs/operators';

const store: Store<State> = Container.instance.get(Store) as Store<State>;

export async function getStateOnce(): Promise<State> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
        store.state.pipe(first()).subscribe((state: State) => resolve(state), (e) => reject(e));
    });
}

export const getCurrentState = () => (store as any)._state.getValue() as State;

export default store;
