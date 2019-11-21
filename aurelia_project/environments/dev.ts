import { baseEnvironmentConfiguration } from 'base-environment';

export const environment: Partial<EnvironmentInterface> = {
    ...baseEnvironmentConfiguration,
    debug: false,
    testing: false,
    chainId: 'ssc-mainnet1',
    RPC_URL: 'https://api.steem-engine.com/rpc2',
    NODE_API_URL: 'https://node-api.steem-engine.com/v1/',
    ACCOUNTS_API_URL: 'https://api.steem-engine.com/accounts',
    CONVERTER_API: 'https://converter-api.steem-engine.com/api',
    nativeToken: 'ENG',
    steempAccount: 'steem-peg'
};
