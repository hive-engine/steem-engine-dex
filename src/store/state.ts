export interface State {
    account: any;
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
