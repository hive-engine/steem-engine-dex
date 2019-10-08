import { HttpClient } from 'aurelia-fetch-client';
import { usdFormat, queryParam } from 'common/functions';
import { environment } from './../environment';
import { ssc } from './ssc';
import { tryParse } from './functions';
import { dispatchify } from 'aurelia-store';
import { setTokens, setAccount } from 'store/actions';
import { getStateOnce } from 'store/store';

const http = new HttpClient();

export async function request(url: string, params: any = {}) {
    // Cache buster
    params.v = new Date().getTime();

    url = url + queryParam(params);

    return http.fetch(url, {
        method: 'GET'
    });
}

/**
 * 
 * @param symbol a Steem-Engine token symbol (required)
 * @param timestampStart a unix timestamp that represents the start of the dataset (optional)
 * @param timestampEnd a unix timestamp that represents the end of the dataset (optional)
 */
export async function loadTokenMarketHistory(symbol: string, timestampStart?: string, timestampEnd?: string): Promise<IHistoryApiItem[]> {
    let url = `${environment.HISTORY_API}?symbol=${symbol.toUpperCase()}`;

    if (timestampStart) {
        url += `&timestampStart=${timestampStart}`;
    }

    if (timestampEnd) {
        url += `&timestampEnd=${timestampEnd}`;
    }

    const response = await http.fetch(url, {
        method: 'GET'
    });

    return response.json() as Promise<IHistoryApiItem[]>;
}

export async function loadTokens(): Promise<any[]> {
    return new Promise((resolve) => {
        ssc.find('tokens', 'tokens', { }, 1000, 0, [], (err, result) => {
            const tokens = result.filter(t => !environment.DISABLED_TOKENS.includes(t.symbol));

            ssc.find('market', 'metrics', { }, 1000, 0, '', false).then(async (metrics) => {
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
                        token.metadata = {};
                    }

                    if (!metrics) {
                        return;
                    }

                    const metric = metrics.find(m => token.symbol == m.symbol);

                    if (metric) {
                        token.highestBid = parseFloat(metric.highestBid);
                        token.lastPrice = parseFloat(metric.lastPrice);
                        token.lowestAsk = parseFloat(metric.lowestAsk);
                        token.marketCap = token.lastPrice * token.circulatingSupply;
                        token.usdValue = usdFormat(token.lastPrice);
                        
                        if (Date.now() / 1000 < metric.volumeExpiration) {
                            token.volume = parseFloat(metric.volume);
                        }

                        if(Date.now() / 1000 < metric.lastDayPriceExpiration) {
                            token.priceChangePercent = parseFloat(metric.priceChangePercent);
                            token.priceChangeSteem = parseFloat(metric.priceChangeSteem);
                        }

                        if (token.symbol == 'AFIT') {
                            const afit_data = await ssc.find('market', 'tradesHistory', { symbol: 'AFIT' }, 100, 0, [{ index: 'timestamp', descending: false }], false);
                            token.volume = (afit_data) ? afit_data.reduce((t, v) => t += parseFloat(v.price) * parseFloat(v.quantity), 0) : 0;
                        }
                    }

                    if (token.symbol === 'STEEMP') {
                        token.lastPrice = 1;
                    }
                };

                tokens.sort((a, b) => {
                    return (b.volume > 0 ? b.volume : b.marketCap / 1000000000) - (a.volume > 0 ? a.volume : a.marketCap / 1000000000);
                });

                const steemp_balance = await ssc.findOne('tokens', 'balances', { account: 'steem-peg', symbol: 'STEEMP' });

                if (steemp_balance && steemp_balance.balance) {
                    const token = tokens.find(t => t.symbol === 'STEEMP');

                    token.supply -= parseFloat(steemp_balance.balance);
                    token.circulatingSupply -= parseFloat(steemp_balance.balance);
                }

                if (steemp_balance && steemp_balance.balance) {
                    const token = tokens.find(t => t.symbol === 'STEEMP');

                    token.supply -= parseFloat(steemp_balance.balance);
                    token.circulatingSupply -= parseFloat(steemp_balance.balance);
                }

                resolve(tokens);
            });
        });
    });
}

export async function loadBalances(account: string): Promise<BalanceInterface[]> {
    const loadedBalances: BalanceInterface[] = await ssc.find('tokens', 'balances', { account: account }, 1000, 0, '', false);

    if (loadedBalances.length) {
        const state = await getStateOnce();

        const balances = loadedBalances
            .filter(b => !environment.DISABLED_TOKENS.includes(b.symbol))
            .map(d => {
                const tokens = state.tokens;
                const token = tokens.find(t => t.symbol === d.symbol);
                const scotConfig = (state.account.name && Object.keys(state.account.scotTokens).length && typeof state.account.scotTokens[token.symbol] !== 'undefined') 
                ? state.account.scotTokens[token.symbol] : null;

                return { ...d, ...{
                    name: token.name,
                    lastPrice: token.lastPrice,
                    priceChangePercent: token.priceChangePercent,
                    usdValue: usdFormat(parseFloat(d.balance) * token.lastPrice, 2),
                    scotConfig
                } };
            });

        balances.sort((a, b) => parseFloat(b.balance) * b.lastPrice * window.steem_price - parseFloat(b.balance) * a.lastPrice * window.steem_price);

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

export function checkTransaction(trx_id, retries, callback) {
    ssc.getTransactionInfo(trx_id, (err, result) => {
        if (result) {
            let error = null;

            if (result.logs) {
                const logs = JSON.parse(result.logs);

                if (logs.errors && logs.errors.length > 0) {
                    error = logs.errors[0];
                }
            }

            if (callback) {
                callback(Object.assign(result, { error: error, success: !error }));
            }	
        } else if (retries > 0) {
            setTimeout(() => checkTransaction(trx_id, retries - 1, callback), 5000);
        } else if (callback) {
            callback({ success: false, error: 'Transaction not found.' });
        }
    });
}
