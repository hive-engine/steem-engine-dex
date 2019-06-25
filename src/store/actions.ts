import { State } from './state';
import store from './store';

export function loading(state: State, boolean: boolean) {
    const newState = { ...state };

    newState.loading = Boolean(boolean);

    return newState;
}

export async function login(state: State, account: any): Promise<State> {
    let newState = { ...state };

    newState.account = {
        name: account.name,
        account
    };

    newState.loggedIn = true;

    return newState;
}

export async function logout(state: State): Promise<State> {
    const newState = { ...state };

    newState.account = {
        name: '',
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
