interface PeggedToken {
    name: string;
    symbol: string;
    pegged_token_symbol: string;
}

interface EnvironmentInterface {
    debug: boolean;
    testing: boolean;
    FIREBASE_API: string;
    MAINTENANCE_MODE: boolean;
    CHAIN_ID: string;
    siteName: string;
    defaultLocale: string;
    RPC_URL: string;
    ACCOUNTS_API_URL: string;
    CONVERTER_API: string;
    NODE_API_URL: string;
    GRAPHQL_API: string;
    HISTORY_API: string;
    SCOT_API: string;
    STEEMP_ACCOUNT: string;
    NATIVE_TOKEN: string;
    DISABLED_TOKENS: string[];
    PEGGED_TOKEN: string;
    PEGGED_TOKENS: PeggedToken[];
}

interface BalanceInterface {
    _id: number;
    account: string;
    balance: string;
    lastPrice: number;
    name: string;
    priceChangePercent: number;
    scotConfig?: any;
    symbol: string;
    usdValue: string;
}


interface IHistoryApiItem {
    _id: string;
    timestamp: number;
    symbol: string;
    volumeSteem: string;
    volumeToken: string;
    lowestPrice: string;
    highestPrice: string;
}
