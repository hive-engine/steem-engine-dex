import { environment } from 'environment';

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
        notifications: [],
        nfts: []
    },
    settings: {
        disableDeposits: false,
        disableWithdrawals: false,
        disabledTokens: environment.disabledTokens,
        maintenanceMode: environment.maintenanceMode,
        siteName: 'Steem Engine',
        nativeToken: environment.nativeToken
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
    nfts: [],
    instances: [],
    nftSellBook: [],
    tokensLoaded: false
};
