export const baseEnvironmentConfiguration: Partial<EnvironmentInterface> = {
    siteName: 'Steem Engine.',
    defaultLocale: 'en',
    GRAPHQL_API: 'https://graphql.steem.services/',
    SCOT_API: 'https://scot-api.steem-engine.com/',
    HISTORY_API: 'https://history.steem-engine.com/',
    FIREBASE_API: 'https://us-central1-steem-engine-dex.cloudfunctions.net/api/',
    maintenanceMode: false,
    disabledTokens: ['BTC', 'LTC', 'STEEM', 'SBD', 'BCC', 'XAP', 'XRP', 'GOLOS', 'DISNEY', 'AMAZON', 'VOICE', 'ETH', 'EOS', 'LASSE', 'TIME', 'R', 'SCTR', 'ALLAH'],
    peggedToken: 'STEEMP',
    features: {
        nfts: {
            enabled: true
        }
    }
};
