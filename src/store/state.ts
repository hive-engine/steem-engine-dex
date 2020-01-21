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
    instance: null,
    instances: [],
    nftSellBook: [],
    tokensLoaded: false
};
