import { AuthType } from './../common/types';
import { Subscription } from 'rxjs';
import { I18N } from 'aurelia-i18n';
import { State } from 'store/state';
import { HttpClient } from 'aurelia-fetch-client';
import { lazy } from 'aurelia-framework';
import environment from 'environment';
import SSC from 'sscjs';
import { connectTo, dispatchify, Store } from 'aurelia-store';
import steem from 'steem';
import { logout } from 'store/actions';

import { ToastService, ToastMessage } from './toast-service';
import { queryParam, popupCenter, tryParse } from 'common/functions';

@connectTo()
export class SteemEngine {
    private http: HttpClient;
    private http2: HttpClient;
    private ssc;
    private state: State;
    private subscription: Subscription;

    constructor(
        @lazy(HttpClient) private getHttpClient: () => HttpClient,
        private i18n: I18N,
        private store: Store<State>,
        private toast: ToastService) {
        this.http = getHttpClient();
        this.http2 = getHttpClient();

        this.ssc = new SSC(environment.RPC_URL);

        this.http.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl(environment.ACCOUNTS_API_URL);
        });

        this.http2.configure(config => config.useStandardConfiguration());

        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;
            }
        });
    }

    request(url: string, params: any) {
        // Cache buster
        params.v = new Date().getTime();

        url = url + queryParam(params);

        this.http.fetch(url, {
            method: 'GET'
        })
    }

    async loadSteemPrice() {
        const request = await this.http2.fetch('https://postpromoter.net/api/prices', {
            method: 'get'
        });

        const response = await request.json();

        return parseFloat(response.steem_price);
    }

    async login(username: string, key?: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            if (window.steem_keychain && !key) {
                steem_keychain.requestSignBuffer(username, 'Log In', 'Posting', function(response) {
                    if (response.error) {
                        const toast = new ToastMessage();
    
                        toast.message = this.i18n.tr('errorLogin', {
                            username, 
                            ns: 'errors' 
                        });
    
                        this.toast.error(toast);
                    } else {
                        localStorage.setItem('username', username);
                        resolve(username);
                    }
                });
            } else {
                try {
                    if (key && !steem.auth.isWif(key)) {
                        key = steem.auth.getPrivateKeys(username, key, ['posting']).posting;
                    }
                } catch(err) {
                    const toast = new ToastMessage();
    
                    toast.message = this.i18n.tr('invalidPrivateKeyOrPassword', { 
                        ns: 'errors' 
                    });
    
                    this.toast.error(toast);
                    return;
                }
    
                try {
                    const user = await steem.api.getAccountsAsync([username]);
    
                    if (user && user.length > 0) {
                        try {
                            if (steem.auth.wifToPublic(key) == user[0].memo_key || steem.auth.wifToPublic(key) === user[0].posting.key_auths[0][0]) {
                                localStorage.setItem('username', username);
                                localStorage.setItem('key', key);

                                resolve(username);
                            } else {
                                const toast = new ToastMessage();
    
                                toast.message = this.i18n.tr('errorLogin', { 
                                    ns: 'errors' 
                                });
                
                                this.toast.error(toast);
                            }
                        } catch(err) {
                            const toast = new ToastMessage();
    
                            toast.message = this.i18n.tr('errorLogin', { 
                                ns: 'errors' 
                            });
            
                            this.toast.error(toast);
                        }
                    } else {
                        const toast = new ToastMessage();
    
                        toast.message = this.i18n.tr('errorLoading', { 
                            ns: 'errors' 
                        });
        
                        this.toast.error(toast);
                    }
                } catch (e) {
                    return;
                }
            }
        });
    }

    logout() {
        dispatchify(logout)();
    }

    async steemConnectJson(auth_type: AuthType, id: string, data) {
        return new Promise((resolve, reject) => {
            const username = this.state.account;

            let url = 'https://steemconnect.com/sign/custom-json?';

            if (auth_type == 'active') {
                url += 'required_posting_auths=' + encodeURI('[]');
                url += '&required_auths=' + encodeURI('["' + username + '"]');
            } else {
                url += 'required_posting_auths=' + encodeURI('["' + username + '"]');
            }
    
            url += '&id=' + environment.CHAIN_ID;
            url += '&json=' + encodeURI(JSON.stringify(data));
    
            popupCenter(url, 'steemconnect', 500, 560);
        });
    }

    async getAccount(username: string) {
        try {
            const user = await steem.api.getAccountsAsync([username]); 
        
            return user && user.length > 0 ? user[0] : null;
        } catch (e) {
            throw new Error(e);
        }
    }

    async loadBalances(account: string) {
        return await this.ssc.find('tokens', 'balances', { account: account }, 1000, 0, '', false);
    }

    async loadTokens() {
        return new Promise((resolve, reject) => {
            this.ssc.find('tokens', 'tokens', { }, 1000, 0, [], (err, result) => {
                let tokens = result;
    
                this.ssc.find('market', 'metrics', { }, 1000, 0, '', false).then(async (metrics) => {
                    tokens.forEach(token => {
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
                            
                            if (Date.now() / 1000 < metric.volumeExpiration) {
                                token.volume = parseFloat(metric.volume);
                            }
    
                            if(Date.now() / 1000 < metric.lastDayPriceExpiration) {
                                token.priceChangePercent = parseFloat(metric.priceChangePercent);
                                token.priceChangeSteem = parseFloat(metric.priceChangeSteem);
                            }
                        }
    
                        if (steemp_balance && steemp_balance.balance) {
                            const token = this.getToken('STEEMP');
                            token.supply -= parseFloat(steemp_balance.balance);
                            token.circulatingSupply -= parseFloat(steemp_balance.balance);
                        }
                    });
    
                    tokens.sort((a, b) => {
                        return (b.volume > 0 ? b.volume : b.marketCap / 1000000000) - (a.volume > 0 ? a.volume : a.marketCap / 1000000000);
                    });
    
                    const steemp_balance = await this.ssc.findOne('tokens', 'balances', { account: 'steem-peg', symbol: 'STEEMP' });
    
                    if (steemp_balance && steemp_balance.balance) {
                        //const token = await this.getToken('STEEMP');
                        //token.supply -= parseFloat(steemp_balance.balance);
                        //token.circulatingSupply -= parseFloat(steemp_balance.balance);
                    }
    
                    resolve(tokens);
                });
            });
        });
    }

    async loadParams() {
        let loaded = 0;
        let params = {};

		this.ssc.findOne('sscstore', 'params', {  }, (err, result) => {
			if(result && !err) {
                params = { ...params, ...result };
            }

			if(++loaded >= 3) {
                return params;
            }
		});

		this.ssc.findOne('tokens', 'params', {  }, (err, result) => {
			if(result && !err) {
                params = { ...params, ...result };
            }

			if(++loaded >= 3) {
                return params;
            }
		});

		this.loadSteemPrice().then(() => {
			if(++loaded >= 3) {
                return params;
            }
		});
    }

    async sendToken(symbol: string, to: string, quantity: number, memo: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const username = localStorage.getItem('username');
    
            if (!username) {
              window.location.reload();
              return;
            }
        
            const transaction_data = {
              'contractName': 'tokens',
              'contractAction': 'transfer',
              'contractPayload': {
                'symbol': symbol,
                'to': to,
                'quantity': quantity,
                'memo': memo
              }
            };
        
            console.log('SENDING: ' + symbol);
        
            if (window.steem_keychain) {
              steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Token Transfer: ' + symbol, (response) => {
                if (response.success && response.result) {
                    this.checkTransaction(response.result.id, 3, tx => {
                        if (tx.success) {
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('tokensSent', {
                                quantity,
                                symbol,
                                to
                            });
            
                            this.toast.success(toast);
                        } else {
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: tx.error
                            });
            
                            this.toast.error(toast);
                            this.loadBalances(username).then(() => {
                                this.showHistory(symbol);
                            });
                        }
                    });
                } else {
                    // hide
                }
              });
            } else {
                    this.steemConnectJson('active', null, transaction_data).then(() => {
                        // this.loadBalances(SE.User.name, () => this.showHistory(symbol));
                    });
                }
        });
    }

    getBalance(token) {
        // if (this.state.account) {
        //     const token2 = this.state.user.balances.find(b => b.symbol === token);
        //     return token2 ? parseFloat(token2.balance) : 0;
        // }

        return 0;
    }

    getToken(symbol: string) {
        return {} as any;
        //return this.tokens.find(t => t.symbol === symbol);
    }

    async showHistory(symbol: string) {
        let token =  this.getToken(symbol);
        
        const history = await this.request('/history', { 
            account: this.state.account, 
            limit: 100, 
            offset: 0, 
            type: 'user', 
            symbol: symbol 
        });
    }

    checkTransaction(trx_id, retries, callback) {
		this.ssc.getTransactionInfo(trx_id, (err, result) => {
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
                setTimeout(() => this.checkTransaction(trx_id, retries - 1, callback), 5000);
            } else if (callback) {
                callback({ success: false, error: 'Transaction not found.' });
            }
		});
    }
    
    async buyBook(symbol, account?: string) {
        if (symbol == environment.PEGGED_TOKEN) {
            symbol = environment.NATIVE_TOKEN;
        }

        const token = this.getToken(symbol);

        if (token.metadata && token.metadata.hide_in_market) {
            return false;
        }

        if (!account) {
            return this.ssc.find('market', 'buyBook', { symbol: symbol }, 200, 0, [{ index: 'price', descending: true }], false);
        }

        return this.ssc.find('market', 'buyBook', { symbol, account }, 200, 0, [{ index: 'price', descending: true }], false);
    }
    
    async sellBook(symbol, account?: string) {
        if (symbol == environment.PEGGED_TOKEN) {
            symbol = environment.NATIVE_TOKEN;
        }

        const token = this.getToken(symbol);

        if (token.metadata && token.metadata.hide_in_market) {
            return false;
        }

        if (!account) {
            return this.ssc.find('market', 'sellBook', { symbol }, 200, 0, [{ index: 'price', descending: false }], false);
        }

        return this.ssc.find('market', 'sellBook', { 
            symbol, 
            account 
        }, 200, 0, [{ index: 'price', descending: false }], false);
    }
    
    async tradesHistory(symbol) {
        if (symbol == environment.PEGGED_TOKEN) {
            symbol = environment.NATIVE_TOKEN;
        }

        const token = this.getToken(symbol);

        if (token.metadata && token.metadata.hide_in_market) {
            return false;
        }

        return this.ssc.find('market', 'tradesHistory', { symbol: symbol }, 30, 0, [{ index: 'timestamp', descending: false }], false);
    }

    async userBalances(symbol, account) {
        if (symbol == environment.PEGGED_TOKEN) {
            symbol = environment.NATIVE_TOKEN;
        }

        const token = this.getToken(symbol);

        if (token.metadata && token.metadata.hide_in_market) {
            return false;
        }

        return this.ssc.find('tokens', 'balances', { account: account, symbol : { '$in' : [symbol, 'STEEMP'] } }, 2, 0, '', false);
    }

    issueToken(symbol, to, quantity) {
        const transaction_data = {
            'contractName': 'tokens',
            'contractAction': 'issue',
            'contractPayload': {
                'symbol': symbol,
                'to': to,
                'quantity': quantity
            }
        };
    }
}
