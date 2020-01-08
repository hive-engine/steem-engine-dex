export const baseEnvironmentConfiguration: Partial<EnvironmentInterface> = {
    siteName: 'Steem Engine.',
    defaultLocale: 'en',
    GRAPHQL_API: 'https://graphql.steem.services/',
    SCOT_API: 'https://scot-api.steem-engine.com/',
    HISTORY_API: 'https://api.steem-engine.com/history/marketHistory',
    FIREBASE_API: 'https://us-central1-steem-engine-dex.cloudfunctions.net/api/',
    maintenanceMode: false,
    disabledTokens: ['BTC', 'STEEM', 'SBD', 'BCC', 'XAP', 'R', 'SCTR', 'ALLAH'],
    peggedToken: 'STEEMP',
    features: {
        nfts: {
            enabled: false
        }
    }
};
