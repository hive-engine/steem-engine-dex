import { usdFormat } from 'common/functions';
/* eslint-disable no-undef */
import { HttpClient } from 'aurelia-fetch-client';
import { queryParam } from 'common/functions';
import { environment } from './../environment';
import { ssc } from './ssc';
import { getStateOnce } from 'store/store';
import { query } from 'common/apollo';

const SCOT_API = 'https://scot-api.steem-engine.com/';
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
    let url = `${environment.HISTORY_API}marketHistory?symbol=${symbol.toUpperCase()}`;

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

export async function loadAccountHistory(
    account: string,
    symbol?: string,
    timestampStart?: string,
    timestampEnd?: string,
    limit?: number,
    offset?: number,
): Promise<IAccountHistoryItemResult[]> {
    let url = `${environment.HISTORY_API}accountHistory?account=${account}`;

    if (symbol) {
        url += `&symbol=${symbol.toUpperCase()}`;
    }

    if (timestampStart) {
        url += `&timestampStart=${timestampStart}`;
    }

    if (timestampEnd) {
        url += `&timestampEnd=${timestampEnd}`;
    }

    if (limit) {
        url += `&limit=${limit}`;
    }

    if (offset) {
        url += `&offset=${offset}`;
    }

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<IAccountHistoryItemResult[]>;
}

/* istanbul ignore next */
export async function loadCoinPairs(): Promise<ICoinPair[]> {
    const url = `${environment.CONVERTER_API}/pairs/`;

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<ICoinPair[]>;
}

/* istanbul ignore next */
export async function loadCoins(): Promise<ICoin[]> {
    const url = `${environment.CONVERTER_API}/coins/`;

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<ICoin[]>;
}

export function parseTokens(data: any): State {
    const tokens = data.tokens.filter(t => !environment.disabledTokens.includes(t.symbol));

    if (data.steempBalance && data.steempBalance.balance) {
        const token = tokens.find(t => t.symbol === 'STEEMP');

        token.supply -= parseFloat(data.steempBalance.balance);
        (token as any).circulatingSupply -= parseFloat(data.steempBalance.balance);
    }

    return tokens;
}

export async function loadSteempBalance() {
    try {
        const result: any = await ssc.findOne('tokens', 'balances', { account: 'steem-peg', symbol: 'STEEMP' });

        return result;
    } catch (e) {
        return null;
    }
}

export async function loadTokens(symbols = [], limit = 50, offset = 0): Promise<any[]> {
    const queryConfig: any = {};

    if (symbols.length) {
        queryConfig.symbol = { $in: symbols };
    }

    const results = [];

    const metrics = await ssc.find('market', 'metrics', queryConfig);
    metrics.sort((a, b) => {
        return (
            parseFloat(b.volume) - parseFloat(a.volume)
        );
    });

    const limitedMetrics = metrics.slice(offset, limit);

    queryConfig.symbol = {
        $in: limitedMetrics.map(m => m.symbol)
    }

    const tokens: any[] = await ssc.find('tokens', 'tokens', queryConfig, limit, offset, [{ index: 'symbol', descending: false }]);

    for (const token of tokens) {
        if (environment.disabledTokens.includes(token.symbol)) {
            continue;
        }

        if (token?.metadata) {
            token.metadata = JSON.parse(token.metadata);
        }

        token.highestBid = 0;
        token.lastPrice = 0;
        token.lowestAsk = 0;
        token.marketCap = 0;
        token.volume = 0;
        token.priceChangePercent = 0;
        token.priceChangeSteem = 0;

        const metric = limitedMetrics.find(m => token.symbol == m.symbol);

        if (!metric) {
            return;
        }

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

        if (token.symbol === 'STEEMP') {
            token.lastPrice = 1;
        }

        results.push(token);
    }

    results.sort((a, b) => {
        return (b.volume > 0 ? b.volume : b.marketCap / 1000000000000) - (a.volume > 0 ? a.volume : a.marketCap / 1000000000000);
    });

    const steempBalance = await loadSteempBalance();

    const finalTokens = results.filter(t => !environment.disabledTokens.includes(t.symbol));

    if (steempBalance && steempBalance.balance) {
        const token = finalTokens.find(t => t.symbol === 'STEEMP');

        if (token) {
            token.supply -= parseFloat(steempBalance.balance);
            (token as any).circulatingSupply -= parseFloat(steempBalance.balance);
        }
    }

    return finalTokens;
}

/* istanbul ignore next */
export async function loadExchangeUiLoggedIn(account, symbol) {
    const callQl = await query(`query {
        tokens(symbols: ["${symbol}", "STEEMP"]) {
            issuer,
            symbol,
            name,
            metadata {
                url,
                icon,
                desc
            },
            metric {
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
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        steempBalance {
            account,
            symbol,
            balance
        },
        userBalances: balances(account: "${account}", limit: 1000, offset: 0) {
            account,
            symbol,
            balance,
            delegationsIn,
            delegationsOut,
            pendingUndelegations,
            stake,
            pendingUnstake,
            scotConfig {
                pending_token,
                staked_tokens
            },
            usdValueFormatted
        },
        buyBook(symbol: "${symbol}", limit: 1000, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          sellBook(symbol: "${symbol}", limit: 1000, offset: 0) {
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

/* istanbul ignore next */
export async function loadExchangeUiLoggedOut(symbol) {
    const callQl = await query(`query {
        tokens(symbols: ["${symbol}", "STEEMP"]) {
            issuer,
            symbol,
            name,
            metadata {
                url,
                icon,
                desc
            },
            metric {
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
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        steempBalance {
            account,
            symbol,
            balance
        },
        buyBook(symbol: "${symbol}", limit: 1000, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          sellBook(symbol: "${symbol}", limit: 1000, offset: 0) {
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

export async function getPrices() {
    try {
        const request = await http.fetch(`https://postpromoter.net/api/prices`, {
            headers: {
                'Origin': 'https://steem-engine.com',
                'Referer': 'https://steem-engine.com/?p=conversion_history',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
            }
        });

        return request.json();
    } catch {
        return null;
    }
}

export async function getScotConfigForAccount(account: string) {
    try {
        const result = await http.fetch(`${SCOT_API}@${account}`);

        return result.json();
    } catch (e) {
        return null;
    }
}

export async function loadUserBalances(account: string, limit = 1000, offset = 0) {
    const prices: any = await getPrices();
    const results: any[] = await ssc.find('tokens', 'balances', { account }, limit, offset, '', false);

    const symbols = [];

    for (const symbol of results) {
        symbols.push(symbol.symbol);
    }

    const tokens = await ssc.find('tokens', 'tokens', { symbol: { $in: symbols } }, 1000, 0);
    const metrics = await ssc.find('market', 'metrics', { symbol: { $in: symbols } }, 1000, 0, '', false);

    for (const token of results) {
        if (token?.balance) {
            token.balance = parseFloat(token.balance);
        }

        if (token?.delegationsIn) {
            token.delegationsIn = parseFloat(token.delegationsIn);
        }

        if (token?.delegationsOut) {
            token.delegationsOut = parseFloat(token.delegationsOut);
        }

        if (token?.stake) {
            token.stake = parseFloat(token.stake);
        }

        if (token?.pendingUnstake) {
            token.pendingUnstake = parseFloat(token.pendingUnstake);
        }

        const findToken = tokens.find(t => t.symbol === token.symbol);
        const metric = metrics.find(m => m.symbol === token.symbol);

        token.token = findToken;

        if (token.token) {
            token.token.metadata = JSON.parse(token.token.metadata);
        }

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
        
        token.highestBid = parseFloat(token.highestBid);
        token.lastPrice = parseFloat(token.lastPrice);
        token.lowestAsk = parseFloat(token.lowestAsk);
        token.marketCap = token.lastPrice * parseFloat(token.circulatingSupply);
        token.lastDayPrice = parseFloat(token.lastDayPrice);

        if (token?.lastPrice) {
            token.usdValueFormatted = usdFormat(parseFloat(token.balance) * token.lastPrice, 3, prices.steem_price);
            token.usdValue = usdFormat(parseFloat(token.balance) * token.lastPrice, 3, prices.steem_price, true);
        } else {
            token.usdValueFormatted = usdFormat(parseFloat(token.balance) * 1, 3, prices.steem_price);
            token.usdValue = usdFormat(parseFloat(token.balance) * 1, 3, prices.steem_price, true);
        }
    }

    const scotConfig = await getScotConfigForAccount(account);

    if (results && Object.keys(scotConfig).length) {
        for (const token of results) {
            const scotConfigToken = scotConfig[token.symbol];

            if (scotConfigToken) {
                token.scotConfig = scotConfigToken;
            }
        }
    }

    if (results.length) {
        const balances = results.filter(b => !environment.disabledTokens.includes(b.symbol));

        balances.sort(
            (a, b) =>
                parseFloat(b.balance) * b?.lastPrice ??
                0 * window.steem_price - parseFloat(b.balance) * a?.lastPrice ??
                0 * window.steem_price,
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

export const getTransactionInfo = (trxId: string) =>
    new Promise((resolve, reject) => {
        ssc.getTransactionInfo(trxId, async (err, result) => {
            if (result) {
                if (result.logs) {
                    const logs = JSON.parse(result.logs);

                    if (logs.errors && logs.errors.length > 0) {
                        resolve({
                            ...result,
                            errors: logs.errors,
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

            try {
                return await checkTransaction(trxId, retries - 1);
            } catch (e) {
                return await checkTransaction(trxId, retries - 1);
            }
        } else {
            throw new Error('Transaction not found.');
        }
    }
}

/* istanbul ignore next */
export async function loadConversionSentReceived(account) {
    const callQl = await query(`query {
                conversionReceived(account: "${account}") {
                    count,
                    next, 
                    previous,
                    results {
                    url,
                      from_coin_symbol,
                      to_coin_symbol,
                      from_address,
                      to_address,
                      to_memo,
                      to_amount,
                      to_txid,
                      tx_fee,
                      ex_fee,
                      created_at,
                      updated_at,
                      deposit,
                      from_coin,
                      to_coin
                    }
                  }
  
                conversionSent(account: "${account}") {
                    count,
                    next, 
                    previous,
                    results {
    	                url,
                      from_coin_symbol,
                      to_coin_symbol,
                      from_address,
                      to_address,
                      to_memo,
                      to_amount,
                      to_txid,
                      tx_fee,
                      ex_fee,
                      created_at,
                      updated_at,
                      deposit,
                      from_coin,
                      to_coin
                    }
                  }
                }
    `);

    return callQl?.data as {
        conversionSent: IConversionItem;
        conversionReceived: IConversionItem;
    };
}
