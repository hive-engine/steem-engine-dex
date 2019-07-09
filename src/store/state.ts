export interface AccountInterface {
    name: string;
    account: any;
    balances: any[];
    scotTokens: any[];
    pendingUnstakes: any[];
}

export interface State {
    account: AccountInterface;
    loggedIn: boolean;
    loading: boolean;
}

export const initialState: State = {
    account: {
        name: '',
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: []
    },
    loggedIn: false,
    loading: false
};
