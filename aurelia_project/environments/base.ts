export const baseEnvironmentConfiguration: Partial<EnvironmentInterface> = {
    siteName: 'Steem Engine.',
    defaultLocale: 'en',
    GRAPHQL_API: 'https://graphql.steem.services/',
    SCOT_API: 'https://scot-api.steem-engine.com/',
    HISTORY_API: 'https://api.steem-engine.com/history/',
    CONVERTER_API: 'https://converter-api.steem-engine.com/api/',
    FIREBASE_API: 'https://us-central1-steem-engine-dex.cloudfunctions.net/api/',
    maintenanceMode: false,
    disabledTokens: ['BTC', 'LTC', 'STEEM', 'SBD', 'BCC', 'XAP', 'XRP', 'GOLOS', 'DISNEY', 'AMAZON', 'VOICE', 'ETH', 'EOS', 'LASSE', 'TIME', 'R', 'SCTR', 'ALLAH', 'DONE', 'BNB', 'ETHER', 'LTCPEG', 'SBC', 'LASSECASH', 'HIVE', 'TIX', 'TIXM', 'STEM', 'STEMM', 'LEO', 'LEOM', 'LEOMM', 'NEO', 'NEOX', 'PORN', 'SPORTS', 'BATTLE', 'SIM', 'CTP', 'CTPM', 'EMFOUR', 'CCC', 'CCCM', 'BEER', 'WEED', 'WEEDM', 'WEEDMM', 'SPACO', 'SPACOM', 'NEOXAG', 'NEOXAGM', 'KANDA', 'SAND', 'INFOWARS', 'SPI', 'PAL', 'PALM', 'PALMM', 'ENGAGE', 'BRO', 'CC', 'BUILDTEAM', 'ECO'],
    peggedToken: 'STEEMP',
    features: {
        nfts: {
            enabled: true
        }
    }
};
