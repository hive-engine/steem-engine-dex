export interface AccountInterface {
    name: string;
    account: any;
    balances: any[];
    scotTokens: any[];
    pendingUnstakes: any[];
    token: any;
    notifications: any[];
}

export interface ISettings {
    disableDeposits: boolean;
    disableWithdrawals: boolean;
    disabledTokens: string[];
    maintenanceMode: boolean;
    siteName: string;
}

export interface State {
    account: AccountInterface;
    settings: ISettings;
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
        token: {},
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: [],
        notifications: []
    },
    settings: {
        disableDeposits: false,
        disableWithdrawals: false,
        disabledTokens: [],
        maintenanceMode: false,
        siteName: 'Steem Engine'
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
