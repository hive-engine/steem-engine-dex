export interface AccountInterface {
    name: string;
    account: any;
    balances: any[];
    scotTokens: any[];
    pendingUnstakes: any[];
}

export interface State {
    account: AccountInterface;
    firebaseUser: any;
    loggedIn: boolean;
    loading: boolean;
    tokens: any[];
}

export const initialState: State = {
    account: {
        name: '',
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: []
    },
    firebaseUser: {},
    loggedIn: false,
    loading: false,
    tokens: []
};
