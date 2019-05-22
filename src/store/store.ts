import { Container } from 'aurelia-framework';
import { Store } from 'aurelia-store';
import { State } from './state';

const store: Store<State> = Container.instance.get(Store);

export const getStateOnce = async () => {
  let state;
  
  const subscription = await store.state.subscribe((innerState) => {
    state = innerState;
  });

  subscription.unsubscribe();
  
  return state;
}

export const getCurrentState = () => (store as any)._state.getValue();

export default store;
