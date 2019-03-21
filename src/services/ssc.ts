import environment from 'environment';

export class Ssc {
    private instance;

    constructor() {
        this.instance = new SSC(environment.RPC_URL);
    }

    loadTokens() {
        return new Promise((resolve, reject) => {
            this.instance.find('tokens', 'tokens', {}, 1000, 0, [], async (err, result) => {
                if (err) {
                    return reject(err);
                }

                const TOKENS = result;

                const metrics = await this.instance.find('market', 'metrics', {}, 1000, 0, '', false);

                if (!metrics) {
                    return reject('Could not load market metrics');
                }

                TOKENS.forEach(token => {
                    token.highestBid = 0;
                    token.lastPrice = 0;
                    token.lowestAsk = 0;
                    token.marketCap = 0;
                    token.volume = 0;
                    token.priceChangePercent = 0;
                    token.priceChangeSteem = 0;
                    
                    try {
                        token.metadata = JSON.parse(token.metadata);
                    } catch (e) {
                        //
                    }

                    if (!token.metadata) {
                        token.metadata = {};
                    }

                    const metric = metrics.find(m => token.symbol == m.symbol);

					if (metric) {
						token.highestBid = parseFloat(metric.highestBid);
						token.lastPrice = parseFloat(metric.lastPrice);
						token.lowestAsk = parseFloat(metric.lowestAsk);
						token.marketCap = token.lastPrice * token.circulatingSupply;
						
						if (Date.now() / 1000 < metric.volumeExpiration) {
                            token.volume = parseFloat(metric.volume);
                        }

						if (Date.now() / 1000 < metric.lastDayPriceExpiration) {
							token.priceChangePercent = parseFloat(metric.priceChangePercent);
							token.priceChangeSteem = parseFloat(metric.priceChangeSteem);
						}
					}

					if (token.symbol == 'STEEMP') {
                        token.lastPrice = 1;
                    }
                });

                TOKENS.sort((a, b) => (b.volume > 0 ? b.volume : b.marketCap / 1000000000) - (a.volume > 0 ? a.volume : a.marketCap / 1000000000));

                const STEEMP_BALANCE = await this.instance.findOne('tokens', 'balances', { 
                    account: 'steem-peg',
                    symbol: 'STEEMP'
                });

                if (STEEMP_BALANCE && STEEMP_BALANCE.balance) {
                    const TOKEN: any = this.getToken('STEEMP');

                    TOKEN.supply -= parseFloat(STEEMP_BALANCE.balance);
                    TOKEN.circulatingSupply -= parseFloat(STEEMP_BALANCE.balance);
                }

                resolve(TOKENS);
            });
        });
    }

    getToken(symbol: string) {
        
    }
}
