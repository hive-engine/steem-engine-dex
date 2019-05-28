import { baseEnvironmentConfiguration } from 'base-environment';

export const environment: Partial<EnvironmentInterface> = {
    ...baseEnvironmentConfiguration,
    debug: false,
    testing: false,
	MAINTENANCE_MODE: false,
	CHAIN_ID: 'ssc-00000000000000000002',
	RPC_URL: 'https://testapi.steem-engine.com/',
	ACCOUNTS_API_URL: 'https://testaccounts.steem-engine.com',
    CONVERTER_API: 'https://converter-api.steem-engine.com/api',
    NODE_API_URL: 'http://localhost:3001/',
	NATIVE_TOKEN: 'SSC',
    STEEMP_ACCOUNT: 'steemsc'
};
