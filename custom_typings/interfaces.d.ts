interface EnvironmentInterface {
    debug: boolean;
    testing: boolean;
    FIREBASE_API: string;
    chainId: string;
    siteName: string;
    defaultLocale: string;
    maintenanceMode: boolean;
    RPC_URL: string;
    ACCOUNTS_API_URL: string;
    CONVERTER_API: string;
    NODE_API_URL: string;
    GRAPHQL_API: string;
    HISTORY_API: string;
    SCOT_API: string;
    steempAccount: string;
    nativeToken: string;
    disabledTokens: string[];
    peggedToken: string;
    features: any;
}

interface BalanceInterface {
    metric: any;
    priceChangeSteem: number;
    _id: number;
    account: string;
    balance: string;
    lastPrice: number;
    name: string;
    priceChangePercent: number;
    scotConfig?: any;
    symbol: string;
    usdValue: number;
    usdValueFormatted: string;
    metadata: any;
}


interface IHistoryApiItem {
    _id: string;
    timestamp: number;
    symbol: string;
    volumeSteem: string;
    volumeToken: string;
    lowestPrice: string;
    highestPrice: string;
    openPrice: string;
    closePrice: string;

}

interface ICoinPair {
    _id: number;
    exchange_rate: string;
    from_coin: string;
    from_coin_symbol: string;
    to_coin: string;
    to_coin_symbol: string;
    __str__: string;
}

interface ICoin {
    symbol: string;
    display_name: string;
    our_account: string;
    can_issue: boolean;
    coin_type: string;
    symbol_id: string;
}

interface IReloadEventData {
    reloadUserExchangeData: boolean;
    reloadBuyBook: boolean;
    reloadSellBook: boolean;
    reloadTradeHistory: boolean; 
    reloadTokenOpenOrders: boolean; 
}

interface IToken {
    _id: number;
    circulatingSupply: string;
    delegationEnabled: boolean;
    highestBid: number;
    issuer: string;
    lastPrice: number;
    lowestAsk: number;
    marketCap: number;
    maxSupply: number;
    metadata: {
        desc: string;
        icon: string;
        url: string;
        hide_in_market?: boolean;
    } | null;
    metric?: IMetric;
    name: string;
    numberTransactions: number;
    precision: number;
    priceChangePercent: number;
    priceChangeSteem: number;
    stakingEnabled: boolean;
    supply: number;
    symbol: string;
    totalStaked: string;
    undelegationCooldown: number;
    unstakingCooldown: number;
    usdValue: string;
    volume: number;
}

interface IMetric {
    highestBid: number;
    lastDayPrice: number;
    lastDayPriceExpiration: number;
    lastPrice: number;
    lowestAsk: number;
    priceChangePercent: number;
    priceChangeSteem: number;
    symbol: string;
    volume: number;
    volumeExpiration: number;
}

interface IBalance {
    _id: number;
    account: string;
    balance: string;
    symbol: string;
}

interface IScotToken {
    _id: number;
    downvote_weight_multiplier: number;
    downvoting_power: number;
    earned_mining_token: number;
    earned_other_token: number;
    earned_staking_token: number;
    earned_token: number;
    last_downvote_time: string;
    last_follow_refresh_time: string;
    last_post: string;
    last_root_post: string;
    last_vote_time: string;
    last_won_mining_claim: string;
    last_won_staking_claim: string;
    loki: string;
    muted: boolean;
    name: string;
    pending_token: number;
    precision: number;
    staked_mining_power: number;
    staked_tokens: number;
    symbol: string;
    vote_weight_multiplier: number;
    voting_power: number;
}

interface IRewardToken {
    symbol: string;
    amount: number;
}

interface IPendingUndelegationTransaction {
    account: string;
    completeTimestamp: number;
    quantity: string;
    txID: string;
    symbol: string;
    timestamp_string: string;
}

interface IPendingUnstakeTransaction {
    account: string;
    nextTransactionTimestamp: number;
    quantity: string;
    quantityLeft: string;
    numberTransactionsLeft: string;
    txID: string;
    symbol: string;
    timestamp_string: string;
    millisecPerPeriod: string;
}

interface IConversionItem {
    count: number;
    next: string;
    previous: string;
    results: IConversionItemResult[]
}

interface IConversionItemResult {
    url: string;
    from_coin_symbol: string;
    to_coin_symbol: string;
    from_address: string;
    to_address: string;
    to_memo: string;
    to_amount: string;
    to_txid: string;
    tx_fee: string;
    ex_fee: string;
    created_at: string;
    created_at_string: string;
    updated_at: string;
    deposit: string;
    from_coin: string;
    to_coin: string;
}

interface IAccountHistoryItemResult {
    _id: string;
    blockNumber: number;
    transactionId: string;
    timestamp: number;
    account: string;
    operation: string;
    from: string;
    to: string;
    symbol: string;
    quantityTokens: string;
    quantitySteem: string;    
    quantity: string;
    balance: string;
    timestamp_string: string;
}

interface AccountInterface {
    name: string;
    account: any;
    balances: any[];
    scotTokens: any[];
    pendingUnstakes: any[];
    token: any;
    notifications: any[];
    nfts: INft[]
}

interface ISettings {
    disableDeposits: boolean;
    disableWithdrawals: boolean;
    disabledTokens: string[];
    maintenanceMode: boolean;
    siteName: string;
    nativeToken: string;
}

interface INftProperty {
    authorizedIssuingAccounts: string[] | null;
    authorizedIssuingContracts: string[] | null;
    isReadOnly: boolean;
    name: string;
    type: string;
}

interface INft {
    symbol: string;
    issuer: string;
    name: string;
    orgName: string;
    productName: string;
    supply: number;
    maxSupply: number;
    metadata: {
        url: string;
        icon: string;
        desc: string;
    };
    marketEnabled?: boolean;
    circulatingSupply: number;
    delegationEnabled: boolean;
    undelegationCooldown: number;
    authorizedIssuingAccounts: string[];
    authorizedIssuingContracts: string[];
    properties: INftProperty[];
}

interface INftInstance {
    _id: number;
    account: string;
    ownedBy: string;
    lockedTokens: any;
    properties: any;
    delegatedTo: {
        account: string;
        ownedBy: string;
        undelegatedAt: number;
    }
}

interface INftSellBook {
    _id: number;
    account: string;
    ownedBy: string;
    nftId: any;
    grouping: any;
    instance?: INftInstance;
    timestamp: number;
    price: number;
    priceDec: number;
    priceSymbol: string;
    fee: number;
    timestamp_string: string;
}

interface INftCounterparty {
    account: string;
    ownedBy: string;
    nftIds: [string];
    paymentTotal: string;
}

interface INftTrade {
    _id: number;
    type: string;
    account: string;
    ownedBy: string;
    counterparties: [INftCounterparty];
    priceSymbol: string;
    price: string;
    marketAccount: string;
    fee: string;
    timestamp: number;
    volume: number;
}

interface INftInterest {
    _id: string;
    side: string;
    priceSymbol: string;
    grouping: any;
    count: number;
}

interface INftParam {
    nftCreationFee: number;
    nftIssuanceFee: number;
    dataPropertyCreationFee: number;
    enableDelegationFee: number;
}

interface State {
    $action: any;
    account: AccountInterface;
    firebaseUser: any;
    loggedIn: boolean;
    loading: boolean;
    tokens: IToken[];
    tokensLoaded: boolean;
    buyBook: any[];
    sellBook: any[];
    tradeHistory: any[];
    buyTotal?: number;
    sellTotal?: number;
    pendingWithdrawals: any[];
    conversionHistory: any[];
    nft: INft;
    nfts: INft[];
    instances: INftInstance[];
    instance: INftInstance;
    nftSellBook: INftSellBook[];
}
