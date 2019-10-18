import { Store, StoreOptions, StateHistory } from 'aurelia-store';
import { Aurelia, PLATFORM } from 'aurelia-framework';
import { Backend, TCustomAttribute } from 'aurelia-i18n';

export function createStore<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true } } : {};
  return new Store<T>(state, options);
}

export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  return new Store<T>(state, options);
}

export function createUndoableTestStore(state: StateHistory<any>) {
  const options = { history: { undoable: true } };
  const store = new Store(state, options);

  return { state, store };
}

export async function asyncTimer(msec) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, msec);
  });
}
