import { Container } from 'aurelia-framework';
import { localStorageMiddleware, Store, MiddlewarePlacement, rehydrateFromLocalStorage } from 'aurelia-store';
import { State } from './state';

const store: Store<State> = Container.instance.get(Store);

store.registerMiddleware(localStorageMiddleware, MiddlewarePlacement.After, { key: 'steem_marketplace__giftcard' });

store.registerAction('Rehydrate', rehydrateFromLocalStorage);

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
