import { State } from './state';
import store from './store';

import firebase from 'firebase/app';

export function loading(state: State, boolean: boolean) {
    const newState = { ...state };

    newState.loading = Boolean(boolean);

    return newState;
}

export async function login(state: State, username: string): Promise<State> {
    let newState = { ...state };

    newState.account = {
        name: username
    };

    newState.loggedIn = true;

    return newState;
}

export async function logout(state: State): Promise<State> {
    const newState = { ...state };

    newState.account = {
        name: '',
        token: '',
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: []
    };
    
    newState.loggedIn = false;

    return newState;
}

export function setAccount(state: State, account: Partial<State['account']>): State {
    const newState = { ...state };

    // Allow one or more account properties to be overwritten by merge
    newState.account = { ...newState.account, ...account };

    return newState;
}

store.registerAction('loading', loading);
store.registerAction('login', login);
store.registerAction('logout', logout);
store.registerAction('setAccount', setAccount);
