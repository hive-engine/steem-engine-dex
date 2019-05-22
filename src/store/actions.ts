import { SteemEngine } from 'services/steem-engine';
import { Container } from 'aurelia-framework';
import { State } from './state';
import store from './store';

const SE: SteemEngine = Container.instance.get(SteemEngine);

export function loading(state: State, boolean: boolean) {
    const newState = { ...state };

    newState.loading = Boolean(boolean);

    return newState;
}

export async function login(state: State, account: string): Promise<State> {
    let newState = { ...state };

    newState.account = account;
    newState.loggedIn = true;

    return newState;
}

export async function logout(state: State): Promise<State> {
    const newState = { ...state };

    newState.account = '';
    newState.loggedIn = false;

    return newState;
}

store.registerAction('loading', loading);
store.registerAction('login', login);
store.registerAction('logout', logout);
