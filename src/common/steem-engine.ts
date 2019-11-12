/* eslint-disable no-undef */
import { State } from 'store/state';
import { HttpClient } from 'aurelia-fetch-client';
import { usdFormat, queryParam } from 'common/functions';
import { environment } from './../environment';
import { ssc } from './ssc';
import { tryParse } from './functions';
import { getStateOnce } from 'store/store';
import { query } from 'common/apollo';

const http = new HttpClient();

export async function request(url: string, params: any = {}) {
    // Cache buster
    params.v = new Date().getTime();

    url = url + queryParam(params);

    return http.fetch(url, {
        method: 'GET',
    });
}

/**
 *
 * @param symbol a Steem-Engine token symbol (required)
 * @param timestampStart a unix timestamp that represents the start of the dataset (optional)
 * @param timestampEnd a unix timestamp that represents the end of the dataset (optional)
 */
export async function loadTokenMarketHistory(
    symbol: string,
    timestampStart?: string,
    timestampEnd?: string,
): Promise<IHistoryApiItem[]> {
    let url = `${environment.HISTORY_API}?symbol=${symbol.toUpperCase()}`;

    if (timestampStart) {
        url += `&timestampStart=${timestampStart}`;
    }

    if (timestampEnd) {
        url += `&timestampEnd=${timestampEnd}`;
    }

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<IHistoryApiItem[]>;
}

export async function loadCoinPairs(): Promise<ICoinPair[]> {
    const url = `${environment.CONVERTER_API}/pairs/`;

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<ICoinPair[]>;
}

export async function loadCoins(): Promise<ICoin[]> {
    const url = `${environment.CONVERTER_API}/coins/`;

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<ICoin[]>;
}

export function parseTokens(data: any): State {
    const tokens = data.tokens.filter(t => !environment.DISABLED_TOKENS.includes(t.symbol));

    for (const token of tokens) {
        token.highestBid = 0;
        token.lastPrice = 0;
        token.lowestAsk = 0;
        token.marketCap = 0;
        token.volume = 0;
        token.priceChangePercent = 0;
        token.priceChangeSteem = 0;

        token.metadata = tryParse(token.metadata);

        if (!token.metadata) {
            token.metadata = {
                desc: '',
                icon: '',
                url: '',
            };
        }

        if (!data.metrics) {
            return;
        }

        const metric = data.metrics.find(m => token.symbol == m.symbol);

        if (metric) {
            token.highestBid = parseFloat(metric.highestBid);
            token.lastPrice = parseFloat(metric.lastPrice);
            token.lowestAsk = parseFloat(metric.lowestAsk);
            token.marketCap = token.lastPrice * parseFloat(token.circulatingSupply);
            token.usdValue = usdFormat(token.lastPrice);

            if (Date.now() / 1000 < metric.volumeExpiration) {
                token.volume = parseFloat(metric.volume);
            }

            if (Date.now() / 1000 < metric.lastDayPriceExpiration) {
                token.priceChangePercent = parseFloat(metric.priceChangePercent);
                token.priceChangeSteem = parseFloat(metric.priceChangeSteem);
            }
        }

        if (token.symbol === 'STEEMP') {
            token.lastPrice = 1;
        }
    }

    tokens.sort((a, b) => {
        return (
            (b.volume > 0 ? b.volume : b.marketCap / 1000000000) - (a.volume > 0 ? a.volume : a.marketCap / 1000000000)
        );
    });

    if (data.steempBalance && data.steempBalance.balance) {
        const token = tokens.find(t => t.symbol === 'STEEMP');

        token.supply -= parseFloat(data.steempBalance.balance);
        (token as any).circulatingSupply -= parseFloat(data.steempBalance.balance);
    }

    if (data.steempBalance && data.steempBalance.balance) {
        const token = tokens.find(t => t.symbol === 'STEEMP');

        token.supply -= parseFloat(data.steempBalance.balance);
        (token as any).circulatingSupply -= parseFloat(data.steempBalance.balance);
    }

    return tokens;
}

export async function loadTokens(limit = 1000, offset = 0): Promise<any[]> {
    const callQl = await query(`query {
        tokens(limit: ${limit}, offset: ${offset}) {
            issuer,
            symbol,
            name,
            metadata {
                url,
            icon,
            desc
            },
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        metrics(limit: ${limit}, offset: ${offset}) {
            symbol,
            volume,
            volumeExpiration,
            lastPrice,
            lowestAsk,
            highestBid,
            lastDayPrice,
            lastDayPriceExpiration,
            priceChangeSteem,
            priceChangePercent
        },
        steempBalance {
            account,
            symbol,
            balance
        }
    }
    `);

    const { tokens, metrics, steempBalance } = callQl.data as {
        tokens: IToken[];
        metrics: IMetric[];
        steempBalance: IBalance;
    };

    const finalTokens = tokens.filter(t => !environment.DISABLED_TOKENS.includes(t.symbol));

    for (const token of finalTokens) {
        token.highestBid = 0;
        token.lastPrice = 0;
        token.lowestAsk = 0;
        token.marketCap = 0;
        token.volume = 0;
        token.priceChangePercent = 0;
        token.priceChangeSteem = 0;

        if (!token.metadata) {
            token.metadata = {
                desc: '',
                icon: '',
                url: '',
            };
        }

        if (!metrics) {
            return;
        }

        const metric = metrics.find(m => token.symbol == m.symbol);

        if (metric) {
            token.highestBid = parseFloat(metric.highestBid);
            token.lastPrice = parseFloat(metric.lastPrice);
            token.lowestAsk = parseFloat(metric.lowestAsk);
            token.marketCap = token.lastPrice * parseFloat(token.circulatingSupply);
            token.usdValue = usdFormat(token.lastPrice);

            if (Date.now() / 1000 < metric.volumeExpiration) {
                token.volume = parseFloat(metric.volume);
            }

            if (Date.now() / 1000 < metric.lastDayPriceExpiration) {
                token.priceChangePercent = parseFloat(metric.priceChangePercent);
                token.priceChangeSteem = parseFloat(metric.priceChangeSteem);
            }
        }

        if (token.symbol === 'STEEMP') {
            token.lastPrice = 1;
        }
    }

    finalTokens.sort((a, b) => {
        return (
            (b.volume > 0 ? b.volume : b.marketCap / 1000000000) - (a.volume > 0 ? a.volume : a.marketCap / 1000000000)
        );
    });

    if (steempBalance && steempBalance.balance) {
        const token = finalTokens.find(t => t.symbol === 'STEEMP');

        token.supply -= parseFloat(steempBalance.balance);
        (token as any).circulatingSupply -= parseFloat(steempBalance.balance);
    }

    if (steempBalance && steempBalance.balance) {
        const token = finalTokens.find(t => t.symbol === 'STEEMP');

        token.supply -= parseFloat(steempBalance.balance);
        (token as any).circulatingSupply -= parseFloat(steempBalance.balance);
    }

    return finalTokens;
}

export async function loadExchangeUiLoggedIn(account, symbol) {
    const callQl = await query(`query {
        tokens(limit: 1000, offset: 0) {
            issuer,
            symbol,
            name,
            metadata {
                url,
            icon,
            desc
            },
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        metrics(limit: 1000, offset: 0) {
            symbol,
            volume,
            volumeExpiration,
            lastPrice,
            lowestAsk,
            highestBid,
            lastDayPrice,
            lastDayPriceExpiration,
            priceChangeSteem,
            priceChangePercent
        },
        steempBalance {
            account,
            symbol,
            balance
        },
        userBalances: balances(account: "${account}", limit: 1000, offset: 0) {
            account,
            symbol,
            balance
        },
        buyBook(symbol: "${symbol}", limit: 200, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          sellBook(symbol: "${symbol}", limit: 200, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            expiration
          },
          tradesHistory(symbol: "${symbol}", limit: 30, offset: 0) {
            type,
            symbol,
            quantity,
            price,
            timestamp
          },
          userBuyBook: buyBook(symbol: "${symbol}", account: "${account}", limit: 100, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          userSellBook: sellBook(symbol: "${symbol}", account: "${account}", limit: 100, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            expiration
          },
          tokenBalance(symbol: "${symbol}", account: "${account}") {
            account,
            symbol,
            balance
          }
    }
    `);

    return callQl?.data as {
        tokens: IToken[];
        metrics: IMetric[];
        steempBalance: IBalance;
        userBalances: IBalance[];
        buyBook: any;
        sellBook: any;
        tradesHistory: any;
        userBuyBook: any;
        userSellBook: any;
        tokenBalance: any;
    };
}

export async function loadExchangeUiLoggedOut(symbol) {
    const callQl = await query(`query {
        tokens(limit: 1000, offset: 0) {
            issuer,
            symbol,
            name,
            metadata {
                url,
            icon,
            desc
            },
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        metrics(limit: 1000, offset: 0) {
            symbol,
            volume,
            volumeExpiration,
            lastPrice,
            lowestAsk,
            highestBid,
            lastDayPrice,
            lastDayPriceExpiration,
            priceChangeSteem,
            priceChangePercent
        },
        steempBalance {
            account,
            symbol,
            balance
        },
        buyBook(symbol: "${symbol}", limit: 200, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          sellBook(symbol: "${symbol}", limit: 200, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            expiration
          },
          tradesHistory(symbol: "${symbol}", limit: 30, offset: 0) {
            type,
            symbol,
            quantity,
            price,
            timestamp
          }
    }
    `);

    return callQl?.data as {
        tokens: IToken[];
        metrics: IMetric[];
        steempBalance: IBalance;
        userBalances: IBalance[];
        buyBook: any;
        sellBook: any;
        tradesHistory: any;
        userBuyBook: any;
        userSellBook: any;
        tokenBalance: any;
    };
}

export async function loadBalances(account: string): Promise<BalanceInterface[]> {
    const getUserBalances = await query(`query {
        balances(account: "${account}", limit: 1000, offset: 0) {
            symbol,
            balance
        }
    }`);
    
    const loadedBalances: BalanceInterface[] = getUserBalances.data.balances;

    if (loadedBalances.length) {
        const state = await getStateOnce();
        const tokens = state.tokens;

        const balances = loadedBalances
            .filter(b => !environment.DISABLED_TOKENS.includes(b.symbol))
            .map(d => {
                const token = tokens.find(t => t.symbol === d.symbol);
                const scotConfig =
                    state.account.name &&
                    Object.keys(state.account.scotTokens).length &&
                    typeof state.account.scotTokens[token.symbol] !== 'undefined'
                        ? state.account.scotTokens[token.symbol]
                        : null;

                return {
                    ...d,
                    ...{
                        name: token.name,
                        lastPrice: token.lastPrice,
                        priceChangePercent: token.priceChangePercent,
                        usdValue: usdFormat(parseFloat(d.balance) * token.lastPrice, 2),
                        stakingEnabled: token.stakingEnabled,
                        delegationEnabled: token.delegationEnabled,
                        issuer: token.issuer,
                        metadata: token.metadata,
                        scotConfig,
                    },
                };
            });

        balances.sort(
            (a, b) =>
                parseFloat(b.balance) * b.lastPrice * window.steem_price -
                parseFloat(b.balance) * a.lastPrice * window.steem_price,
        );

        return balances;
    } else {
        return [];
    }
}

export async function loadPendingUnstakes(account: string) {
    try {
        const result = await ssc.find('tokens', 'pendingUnstakes', { account: account }, 1000, 0, '', false);

        return result;
    } catch (e) {
        return [];
    }
}

const delay = t => new Promise(resolve => setTimeout(resolve, t));

const getTransactionInfo = (trxId: string) =>
    new Promise((resolve, reject) => {
        ssc.getTransactionInfo(trxId, async (err, result) => {
            if (result) {
                if (result.logs) {
                    const logs = JSON.parse(result.logs);

                    if (logs.errors && logs.errors.length > 0) {
                        reject({
                            ...result,
                            error: logs.errors[0],
                        });
                    }
                }

                resolve(result);
            } else {
                reject(err);
            }
        });
    });

export async function checkTransaction(trxId: string, retries: number) {
    try {
        return await getTransactionInfo(trxId);
    } catch (e) {
        if (retries > 0) {
            await delay(5000);
            return await checkTransaction(trxId, retries - 1);
        } else {
            throw new Error('Transaction not found.');
        }
    }
}
