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

export interface INftProperty {
    authorizedIssuingAccounts: string[] | null;
    authorizedIssuingContracts: string[] | null;
    isReadOnly: boolean;
    name: string;
    type: string;
}

export interface INft {
    issuer: string;
    name: string;
    supply: number;
    maxSupply: number;
    metadata: {
        url: string;
        icon: string;
        desc: string;
    };
    circulatingSupply: number;
    delegationEnabled: boolean;
    undelegationCooldown: number;
    authorizedIssuingAccounts: string[];
    authorizedIssuingContracts: string[];
    properties: INftProperty[];
}

export interface State {
    $action: any;
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
    pendingWithdrawals: any[];
    conversionHistory: any[];
    nft: INft;
    nfts: INft[];
}

export const initialState: State = {
    $action: {
        name: '',
        params: {}
    },
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
    conversionHistory: [],
    buyTotal: 0,
    sellTotal: 0,
    pendingWithdrawals: [],
    nft: null,
    nfts: []
};
