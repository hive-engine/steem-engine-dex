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

store.registerAction('loading', loading);
store.registerAction('login', login);
store.registerAction('logout', logout);
