import { AuthType } from './../common/types';
import { I18N } from 'aurelia-i18n';
import { State } from 'store/state';
import { HttpClient, json } from 'aurelia-fetch-client';
import { lazy, autoinject } from 'aurelia-framework';
import { environment } from 'environment';

import SSC from 'sscjs';
import steem from 'steem';

import { connectTo, dispatchify } from 'aurelia-store';

import { logout } from 'store/actions';

import { ToastService, ToastMessage } from './toast-service';
import { queryParam, popupCenter, tryParse, usdFormat } from 'common/functions';
import { SteemKeychain } from './steem-keychain';
import { EventAggregator } from 'aurelia-event-aggregator';

@connectTo()
@autoinject()
export class SteemEngine {
    private accountsApi: HttpClient;
    private http: HttpClient;
    public ssc;
    private state: State;

    public user = null;
    public params = {};
    public tokens = [];
    public scotTokens = {};
    public steemPrice = 0;
    private _sc_callback;

    constructor(
        @lazy(HttpClient) private getHttpClient: () => HttpClient,
        private ea: EventAggregator,
        private i18n: I18N,
        private toast: ToastService,
        private keychain: SteemKeychain) {
        this.accountsApi = getHttpClient();
        this.http = getHttpClient();

        this.ssc = new SSC(environment.RPC_URL);

        this.accountsApi.configure(config => {
            config
                .useStandardConfiguration()
                .withBaseUrl(environment.ACCOUNTS_API_URL);
        });

        this.http.configure(config => config.useStandardConfiguration());
    }

    request(url: string, params: any = {}) {
        // Cache buster
        params.v = new Date().getTime();

        url = url + queryParam(params);

        return this.http.fetch(url, {
            method: 'GET'
        });
    }

    async loadSteemPrice() {
        try {
            const request = await this.http.fetch('https://postpromoter.net/api/prices', {
                method: 'GET'
            });
    
            const response = await request.json();

            window.steem_price = parseFloat(response.steem_price);

            this.steemPrice = window.steem_price;

            this.ea.publish('steem:price:updated', window.steem_price);
    
            return window.steem_price;
        } catch {
            window.steem_price = 0;
            
            return 0;
        }
    }

    async login(username: string, key?: string): Promise<string> {
        return new Promise(async (resolve) => {
            if (window.steem_keychain && !key) {
                steem_keychain.requestSignBuffer(username, 'Log In', 'Posting', function(response) {
                    if (response.error) {
                        const toast = new ToastMessage();
    
                        toast.message = this.i18n.tr('notifications:errorLogin', {
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

                                resolve(username);
                            } else {
                                const toast = new ToastMessage();
    
                                toast.message = this.i18n.tr('errorLogin', { 
                                    ns: 'notifications' 
                                });
                
                                this.toast.error(toast);
                            }
                        } catch(err) {
                            const toast = new ToastMessage();
    
                            toast.message = this.i18n.tr('errorLogin', { 
                                ns: 'notifications' 
                            });
            
                            this.toast.error(toast);
                        }
                    } else {
                        const toast = new ToastMessage();
    
                        toast.message = this.i18n.tr('errorLoading', { 
                            ns: 'notifications' 
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

    async steemConnectJson(auth_type: AuthType, data: any, callback) {
        const username = localStorage.getItem('username');

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

        this._sc_callback = callback;
    }

    async steemConnectJsonId(auth_type: AuthType, id: string, data: any, callback) {
        const username = this.user.name;

        let url = 'https://steemconnect.com/sign/custom-json?';

        if (auth_type == 'active') {
            url += 'required_posting_auths=' + encodeURI('[]');
            url += '&required_auths=' + encodeURI('["' + username + '"]');
        } else {
            url += 'required_posting_auths=' + encodeURI('["' + username + '"]');
        }

        url += '&id=' + id;
        url += '&json=' + encodeURI(JSON.stringify(data));

        popupCenter(url, 'steemconnect', 500, 560);

        this._sc_callback = callback;
    }

    steemConnectTransfer(from: string, to: string, amount: string, memo: string, callback: any) {
        let url = 'https://steemconnect.com/sign/transfer?';
		url += '&from=' + encodeURI(from);
		url += '&to=' + encodeURI(to);
		url += '&amount=' + encodeURI(amount);
		url += '&memo=' + encodeURI(memo);

		popupCenter(url, 'steemconnect', 500, 560);
		window._sc_callback = callback;
    }

    async getAccount(username: string) {
        try {
            const user = await steem.api.getAccountsAsync([username]); 
        
            return user && user.length > 0 ? user[0] : null;
        } catch (e) {
            throw new Error(e);
        }
    }

    async loadPendingUnstakes(account) {
        const result = await this.ssc.find('tokens', 'pendingUnstakes', { account: account }, 1000, 0, '', false);

        if (this.user && account === this.user.name) {
            this.user.pendingUnstakes = result;
        }
        
        return result;
    }

    async loadBalances(account?: string): Promise<BalanceInterface[]> {
        if (!account) {
            account = localStorage.getItem('username') || null;
        }

        if (!account) {
            return null;
        }

        await this.loadTokens();

        const loadedBalances: BalanceInterface[] = await this.ssc.find('tokens', 'balances', { account: account }, 1000, 0, '', false);

        if (loadedBalances.length) {
            const balances = loadedBalances
                .filter(b => !environment.DISABLED_TOKENS.includes(b.symbol))
                .map(d => {
                    const token = this.tokens.find(t => t.symbol === d.symbol);
                    const scotConfig = (this.user && Object.keys(this.user.scotTokens).length && typeof this.user.scotTokens[token.symbol] !== 'undefined') 
                    ? this.user.scotTokens[token.symbol] : null;

                    return { ...d, ...{
                        name: token.name,
                        lastPrice: token.lastPrice,
                        priceChangePercent: token.priceChangePercent,
                        usdValue: usdFormat(parseFloat(d.balance) * token.lastPrice, 2),
                        scotConfig
                    } };
                });

            balances.sort((a, b) => parseFloat(b.balance) * b.lastPrice * window.steem_price - parseFloat(b.balance) * a.lastPrice * window.steem_price);

            if (this.user && account === this.user.name) {
                this.user.balances = balances;
            }
    
            return balances;
        }
    }

    async loadTokens() {
        return new Promise((resolve) => {
            this.ssc.find('tokens', 'tokens', { }, 1000, 0, [], (err, result) => {
                this.tokens = result.filter(t => !environment.DISABLED_TOKENS.includes(t.symbol));
    
                this.ssc.find('market', 'metrics', { }, 1000, 0, '', false).then(async (metrics) => {
                    for (const token of this.tokens) {
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

                            if (token.symbol == 'AFIT') {
                                const afit_data = await this.ssc.find('market', 'tradesHistory', { symbol: 'AFIT' }, 100, 0, [{ index: 'timestamp', descending: false }], false);
                                token.volume = afit_data.reduce((t, v) => t += parseFloat(v.price) * parseFloat(v.quantity), 0);
                            }
                        }

                        if (token.symbol === 'STEEMP') {
                            token.lastPrice = 1;
                        }
                    };
    
                    this.tokens.sort((a, b) => {
                        return (b.volume > 0 ? b.volume : b.marketCap / 1000000000) - (a.volume > 0 ? a.volume : a.marketCap / 1000000000);
                    });
    
                    const steemp_balance = await this.ssc.findOne('tokens', 'balances', { account: 'steem-peg', symbol: 'STEEMP' });

                    if (steemp_balance && steemp_balance.balance) {
                        const token = this.getToken('STEEMP');
                        token.supply -= parseFloat(steemp_balance.balance);
                        token.circulatingSupply -= parseFloat(steemp_balance.balance);
                    }
    
                    if (steemp_balance && steemp_balance.balance) {
                        const token = this.getToken('STEEMP');
                        token.supply -= parseFloat(steemp_balance.balance);
                        token.circulatingSupply -= parseFloat(steemp_balance.balance);
                    }
    
                    resolve(this.tokens);
                });
            });
        });
    }

    async getScotUsertokens(account) {
        if (!account && this.user) {
            account = this.user.name;
        }

        const req = await this.request(`${environment.SCOT_API}@${account}`);
        const scotTokens = await req.json();

        if (scotTokens) {
            this.user.scotTokens = scotTokens;
        }

        return Object.entries(scotTokens);
    }

    async claimToken(symbol: string) {
        const token = this.tokens.find(t => t.symbol === symbol);
        const username = this.user.name;
        const amount = this.user.scotTokens[symbol].pending_token;
        const factor = Math.pow(10, token.precision);
        const calculated = amount / factor;
        
        const claimData = {
			symbol
        };
        
        if (this.keychain.useKeychain) {
            const response = await this.keychain.customJson(username, 'scot_claim_token', 'Posting', JSON.stringify(claimData),`Claim ${calculated} ${symbol.toUpperCase()} Tokens`);
            
            if (response.success && response.result) {

            }
        } else {
            this.steemConnectJsonId('posting', 'scot_claim_token', claimData, () => {
                // Hide loading
            });
        }
    }

    async enableStaking(symbol, unstakingCooldown, numberTransactions) {
        // Show loading

        const username = localStorage.getItem('username');

        if (!username) {
            window.location.reload();
            return;
        }

        const transaction_data = {
            contractName: 'tokens',
            contractAction: 'enableStaking',
            contractPayload: {
                symbol,
                unstakingCooldown,
                numberTransactions
            }
        };

        if (this.keychain.useKeychain) {
            const response = await this.keychain.customJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Enable Token Staking');

            if (response.success && response.result) {
                this.checkTransaction(response.result.id, 3, tx => {
                    if (tx.success) {
                        // Show "Token staking enabled" toastr
                    } else {
                        // Show error toastr: 'An error occurred attempting to enable staking on your token: ' + tx.error
                    }

                    // Hide loading

                    // Hide dialog
                });
            } else {
                // Hide loading
            }
        } else {
            this.steemConnectJson('active', transaction_data, () => {
                // Hide loading

                // Hide dialog
            });
        }
    }

    async stake(symbol: string, quantity: string) {
        // Show loading

        const username = localStorage.getItem('username');

        if (!username) {
            window.location.reload();
            return;
        }

        const transaction_data = {
            contractName: "tokens",
            contractAction: "stake",
            contractPayload: {
                symbol,
                quantity
            }
        };
        
        if (this.keychain.useKeychain) {
            const response = await this.keychain.customJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Stake Token');

            if (response.success && response.result) {
                this.checkTransaction(response.result.id, 3, tx => {
                    if (tx.success) {
                        // Show "Token successfully staked" toastr
                    } else {
                        // Show error toastr: 'An error occurred attempting to enable stake token: ' + tx.error
                    }

                    // Hide loading

                    // Hide dialog
                });
            } else {
                // Hide loading
            }
        } else {
            this.steemConnectJson('active', transaction_data, () => {
                // Hide loading

                // Hide dialog
            });
        }
    }

    async unstake(symbol: string, quantity: string) {
        // Show loading

        const username = localStorage.getItem('username');

        if (!username) {
            window.location.reload();
            return;
        }

        const transaction_data = {
            contractName: "tokens",
            contractAction: "unstake",
            contractPayload: {
                symbol,
                quantity
            }
        };
        
        if (this.keychain.useKeychain) {
            const response = await this.keychain.customJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Unstake Tokens');

            if (response.success && response.result) {
                this.checkTransaction(response.result.id, 3, tx => {
                    if (tx.success) {
                        // Show "Tokens successfully unstaked" toastr
                    } else {
                        // Show error toastr: 'An error occurred attempting to unstake tokens: ' + tx.error
                    }

                    // Hide loading

                    // Hide dialog
                });
            } else {
                // Hide loading
            }
        } else {
            this.steemConnectJson('active', transaction_data, () => {
                // Hide loading

                // Hide dialog
            });
        }
    }

    async cancelUnstake(txID) {
        // Show loading

        const username = localStorage.getItem('username');

        if (!username) {
          window.location.reload();
          return;
        }

        const transaction_data = {
            contractName: "tokens",
            contractAction: "cancelUnstake",
            contractPayload: {
                txID
            }
        };
        
        if (this.keychain.useKeychain) {
            const response = await this.keychain.customJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Cancel Unstake Tokens');

            if (response.success && response.result) {
                this.checkTransaction(response.result.id, 3, tx => {
                    if (tx.success) {
                        // Show "Token unstaking cancelled" toastr
                    } else {
                        // Show error toastr: 'An error occurred attempting cancel staked tokens : ' + tx.error
                    }

                    // Hide loading

                    // Hide dialog
                });
            } else {
                // Hide loading
            }
        } else {
            this.steemConnectJson('active', transaction_data, () => {
                // Hide loading

                // Hide dialog
            });
        }
    }

    steemConnectCallback() {
        if (this._sc_callback) {
            // Show loading

            setTimeout(() => {
                // Hide loading

                this._sc_callback();
                this._sc_callback = null;

            }, 10000);
        }
    }

    async loadParams() {
        let loaded = 0;

		this.ssc.findOne('sscstore', 'params', {  }, (err, result) => {
			if(result && !err) {
                Object.assign(this.params, result);
            }

			if (++loaded >= 3) {
                return this.params;
            }
		});

		this.ssc.findOne('tokens', 'params', {  }, (err, result) => {
			if(result && !err) {
                Object.assign(this.params, result);
            }

			if(++loaded >= 3) {
                return this.params;
            }
		});

		this.loadSteemPrice().then(() => {
			if(++loaded >= 3) {
                return this.params;
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
                    this.steemConnectJson('active', transaction_data, () => {

                    });
                }
        });
    }

    getBalance(token) {
        if (this.user && this.user.balances) {
            const token = this.user.balances.find(b => b.symbol === token);
            return token ? parseFloat(token.balance) : 0;
        }
    }

    getToken(symbol: string) {
        return this.tokens.find(t => t.symbol === symbol);
    }

    getTokens() {
        return this.tokens;
    }

    async showHistory(symbol: string) {
        let token =  this.getToken(symbol);

        try {
            const history = await this.request('/history', { 
                account: this.state.account, 
                limit: 100, 
                offset: 0, 
                type: 'user', 
                symbol: symbol 
            });
    
            return history.json();
        } catch (e) {
            return [];
        }
    }

    async checkAccount(name) {
        const response = await steem.api.getAccountsAsync([name]);

        if (response && response.length) {
            return response[0];
        }

        return null;
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

    async getDepositAddress(symbol) {
        const peggedToken = environment.PEGGED_TOKENS.find(p => p.symbol === symbol);

        if (!peggedToken) {
            return;
        }

        try {
            const request = await this.http.fetch(`${environment.CONVERTER_API}/convert/`, {
                method: 'POST',
                body: json({from_coin: symbol, to_coin: peggedToken.pegged_token_symbol, destination: this.user.name})
            });

            const response = await request.json();

            return {...response, ...peggedToken};
        } catch {
            return null;
        }
    }

    async getWithdrawalAddress(symbol, address) {
        const peggedToken = environment.PEGGED_TOKENS.find(p => p.symbol === symbol);

        if (!peggedToken) {
            return;
        }

        try {
            const request = await this.http.fetch(`${environment.CONVERTER_API}/convert/`, {
                method: 'POST',
                body: json({from_coin: peggedToken.pegged_token_symbol, to_coin: symbol, destination: address})
            });

            const response = await request.json();

            return {...response, ...peggedToken};
        } catch {
            return null;
        }
    }
}
