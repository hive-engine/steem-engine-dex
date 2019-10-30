declare namespace SSC {
    interface SSC {
        new(rpcUrl: string): SSC;
    }
}

interface IsscToken {
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
    } | null;
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

interface IsscMetric {
    highestBid: string;
    lastDayPrice: string;
    lastDayPriceExpiration: number;
    lastPrice: string;
    lowestAsk: string;
    priceChangePercent: string;
    priceChangeSteem: string;
    symbol: string;
    volume: string;
    volumeExpiration: number;
}

declare const SSC: SSC.SSC;
