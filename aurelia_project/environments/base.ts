export const baseEnvironmentConfiguration: Partial<EnvironmentInterface> = {
    siteName: 'Steem Engine.',
    defaultLocale: 'en',
    GRAPHQL_API: 'https://graphql.steem.services/',
    SCOT_API: 'https://scot-api.steem-engine.com/',
    FIREBASE_API: 'https://us-central1-steem-engine-dex.cloudfunctions.net/api',
    DISABLED_TOKENS: ['BTC', 'STEEM', 'SBD', 'BCC', 'XAP'],
    PEGGED_TOKEN: 'STEEMP',
	PEGGED_TOKENS: [
		{
			name: 'Steem',
			symbol: 'STEEM',
			pegged_token_symbol: 'STEEMP'
		}, 
		{
			name: 'Bitcoin',
			symbol: 'BTC',
			pegged_token_symbol: 'BTCP'
		}, 
		{
			name: 'Litecoin',
			symbol: 'LTC',
			pegged_token_symbol: 'LTCP'
		},
		{
			name: 'EOS',
			symbol: 'EOS',
			pegged_token_symbol: 'EOSP'
		}, 
		{
			name: 'Crypto Peso',
			symbol: 'PSO',
			pegged_token_symbol: 'PSOP'
		},
		{
			name: 'Bitcoin Cash',
			symbol: 'BCH',
			pegged_token_symbol: 'BCHP'
		}, 
		{
			name: 'Dogecoin',
			symbol: 'DOGE',
			pegged_token_symbol: 'DOGEP'
		}
	]
};
