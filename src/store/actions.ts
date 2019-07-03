import { State } from './state';
import store from './store';

import firebase from 'firebase';

export function loading(state: State, boolean: boolean) {
    const newState = { ...state };

    newState.loading = Boolean(boolean);

    return newState;
}

export async function login(state: State, user: { username: string, token: string }): Promise<State> {
    let newState = { ...state };

    try {
        const signin = await firebase.auth().signInWithCustomToken(user.token);

        console.log(signin);
    } catch (e) {
        console.error(e);
    }

    newState.account = {
        name: user.username,
        token: user.token
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
