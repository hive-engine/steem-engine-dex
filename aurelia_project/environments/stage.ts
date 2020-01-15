import { baseEnvironmentConfiguration } from 'base-environment';

export const environment: Partial<EnvironmentInterface> = {
    ...baseEnvironmentConfiguration,
    debug: false,
    testing: false,
    chainId: 'ssc-testnet1',
    GRAPHQL_API: 'https://graphql-qa.steem.services/',
    RPC_URL: 'https://testapi.steem-engine.com/',
    NODE_API_URL: 'https://node-api.steem-engine.com/v1/',
	ACCOUNTS_API_URL: 'https://api.steem-engine.com/accounts',
	CONVERTER_API: 'https://converter-api.steem-engine.com/api',
	nativeToken: 'SSC',
    steempAccount: 'steemsc'
};
