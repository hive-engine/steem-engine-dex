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
    tokens: IToken[];
    buyBook: any[];
    sellBook: any[];
    tradeHistory: any[];
    buyTotal?: number;
    sellTotal?: number;
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
    tokens: [],
    buyBook: [],
    sellBook: [],
    tradeHistory: [],
    buyTotal: 0,
    sellTotal: 0
};
