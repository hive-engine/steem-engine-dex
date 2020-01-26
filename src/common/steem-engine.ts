/* eslint-disable @typescript-eslint/no-use-before-define */
import { usdFormat } from 'common/functions';
/* eslint-disable no-undef */
import { HttpClient } from 'aurelia-fetch-client';
import { queryParam } from 'common/functions';
import { environment } from './../environment';
import { ssc } from './ssc';

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
export async function loadTokenMarketHistory(symbol: string, timestampStart?: string, timestampEnd?: string): Promise<IHistoryApiItem[]> {
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

export async function loadAccountHistory(account: string, symbol?: string, timestampStart?: string, timestampEnd?: string, limit?: number, offset?: number): Promise<IAccountHistoryItemResult[]> {
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

export async function getFormattedCoinPairs() {
    const coins = await loadCoins();
    const pairs = await loadCoinPairs();

    let tokenPairs = [];
    const nonPeggedCoins = coins.filter(x => x.coin_type !== 'steemengine');

    const steem = { name: 'STEEM', symbol: 'STEEM', pegged_token_symbol: 'STEEMP' };
    tokenPairs.push(steem);

    for (const x of nonPeggedCoins) {
        // find pegged coin for each non-pegged coin
        const coinFound = pairs.find(y => y.from_coin_symbol === x.symbol);

        if (coinFound) {
            const tp = {
                name: x.display_name,
                symbol: x.symbol,
                pegged_token_symbol: coinFound.to_coin_symbol
            }

            // check if the token exists
            if (!tokenPairs.find(x => x.pegged_token_symbol == tp.pegged_token_symbol)) {
                tokenPairs.push(tp);
            }
        }
    }

    // sort the coins
    tokenPairs = tokenPairs.sort((a, b) => a.name.localeCompare(b.name));

    return tokenPairs;
}

export function loadPendingWithdrawals(account: string, limit = 1000, offset = 0) {
    const queryConfig: any = {
        recipient: account
    };

    return ssc.find('steempegged', 'withdrawals', queryConfig, limit, offset);
}

export function parseTokens(data: any): State {
    const tokens = data.tokens.filter(t => !environment.disabledTokens.includes(t.symbol));

    if (data.steempBalance && data.steempBalance.balance) {
        const token = tokens.find(t => t.symbol === 'STEEMP');

        if (token) {
            token.supply -= parseFloat(data.steempBalance.balance);
            (token as any).circulatingSupply -= parseFloat(data.steempBalance.balance);
        }
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

export async function loadBuyBook(symbol, limit = 200, offset = 0) {
    return ssc.find('market', 'buyBook', { symbol: symbol }, limit, offset, [{ index: 'priceDec', descending: true }], false);
}

export async function loadAccountBuyBook(symbol, account, limit = 200, offset = 0) {
    return ssc.find('market', 'buyBook', { symbol: symbol, account: account }, limit, offset, [{ index: '_id', descending: true }], false);
}

export async function loadSellBook(symbol, limit = 200, offset = 0) {
    return ssc.find('market', 'sellBook', { symbol: symbol }, limit, offset, [{ index: 'priceDec', descending: false }], false);
}

export async function loadAccountSellBook(symbol, account, limit = 100, offset = 0) {
    return ssc.find('market', 'sellBook', { symbol: symbol, account: account }, limit, offset, [{ index: '_id', descending: true }], false);
}

export async function loadTradesHistory(symbol, limit = 30, offset = 0) {
    return ssc.find('market', 'tradesHistory', { symbol: symbol }, limit, offset, [{ index: '_id', descending: true }], false)
}

export async function loadAccountTokenBalances(account, symbol, limit = 2, offset = 0) {
    return ssc.find('tokens', 'balances', { account: account, symbol : { '$in' : [symbol, 'STEEMP'] } }, limit, offset, '', false);
}

/* istanbul ignore next */
export async function loadExchangeUiLoggedIn(account, symbol) {
    const tokens = await loadTokens([`${symbol}`, 'STEEMP']);
    const steempBalance = await loadSteempBalance();
    const userBalances = await loadUserBalances(account, 1000, 0);
    const buyBook = await loadBuyBook(symbol, 1000, 0);
    const sellBook = await loadSellBook(symbol, 1000, 0);
    const tradesHistory = await loadTradesHistory(symbol, 30, 0);
    const userBuyBook = await loadAccountBuyBook(symbol, account, 100, 0);
    const userSellBook = await loadAccountSellBook(symbol, account, 100, 0);
    const tokenBalance = await loadAccountTokenBalances(account, symbol);

    const response = {
        tokens: tokens,
        steempBalance: steempBalance,
        userBalances: userBalances,
        buyBook: buyBook,
        sellBook: sellBook,
        tradesHistory: tradesHistory,
        userBuyBook: userBuyBook,
        userSellBook: userSellBook,
        tokenBalance: tokenBalance
    } as {
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

    return response;
}

/* istanbul ignore next */
export async function loadExchangeUiLoggedOut(symbol) {
    const tokens = await loadTokens([`${symbol}`, 'STEEMP']);
    const steempBalance = await loadSteempBalance();
    const buyBook = await loadBuyBook(symbol, 1000, 0);
    const sellBook = await loadSellBook(symbol, 1000, 0);
    const tradesHistory = await loadTradesHistory(symbol, 30, 0);

    const response = {
        tokens: tokens,
        steempBalance: steempBalance,
        buyBook: buyBook,
        sellBook: sellBook,
        tradesHistory: tradesHistory
    } as {
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

    return response;
}

export async function loadConversions(account: string, type = 'from', limit = 20, offset = 0): Promise<IConversionItem> {
    let url = `${environment.CONVERTER_API}conversions/`;

    if (type === 'sent') {
        url += `${queryParam({ limit, offset, deposit__from_account: account })}`;
    } else {
        url += `${queryParam({ limit, offset, to_address: account })}`;
    }

    try {
        const request = await http.fetch(url, {
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
    const conversionReceived = await loadConversions(account, 'received');
    const conversionSent = await loadConversions(account, 'sent');

    return {
        conversionReceived,
        conversionSent
    }
}
