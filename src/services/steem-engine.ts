import { AuthService } from './auth-service';
import { I18N } from 'aurelia-i18n';
import { State } from 'store/state';
import { HttpClient, json } from 'aurelia-fetch-client';
import { lazy, autoinject } from 'aurelia-framework';
import { environment } from 'environment';

import firebase from 'firebase/app';

import SSC from 'sscjs';
import steem from 'steem';

import { connectTo } from 'aurelia-store';

import { loadTokens, loadCoinPairs, loadCoins, checkTransaction } from 'common/steem-engine';
import { steemConnectJsonId, steemConnectJson, getAccount, steemConnectTransfer } from 'common/steem';

import { ToastService, ToastMessage } from './toast-service';
import { queryParam, formatSteemAmount, getSteemPrice } from 'common/functions';
import { customJson, requestTransfer } from 'common/keychain';
import moment from 'moment';

@connectTo()
@autoinject()
export class SteemEngine {
    public accountsApi: HttpClient;
    public http: HttpClient;
    public ssc;
    public state: State;

    public user = {
        name: '',
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: [],
        pendingUndelegations: []
    };

    public params = {};
    public tokens = [];
    public scotTokens = {};
    public steemPrice = 0;
    public _sc_callback;

    constructor(
        @lazy(HttpClient) getHttpClient: () => HttpClient,
        private i18n: I18N,
        private toast: ToastService,
        private authService: AuthService) {
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

    getUser() {        
        const username = localStorage.getItem('username');

        if (!this.user && !username) {
            return null;
        }

        if (this.user.name === '' && username) {
            return username;
        }

        if (this.user.name !== '') {
            return this.user.name;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request(url: string, params: any = {}) {
        // Cache buster
        params.v = new Date().getTime();

        url = url + queryParam(params);

        return this.http.fetch(url, {
            method: 'GET'
        });
    }

    async login(username: string, key?: string): Promise<unknown> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve) => {
            if (window.steem_keychain && !key) {
                // Get an encrypted memo only the user can decrypt with their private key
                const encryptedMemo = await this.authService.getUserAuthMemo(username) as string;

                window.steem_keychain.requestVerifyKey(username, encryptedMemo, 'Posting', async response => {
                    if (response.error) {
                        const toast = new ToastMessage();

                        toast.message = this.i18n.tr('errorLogin', {
                            ns: 'notifications'
                        });

                        this.toast.error(toast);
                    } else {
                        // Get the return memo and remove the "#" at the start of the private memo
                        const signedKey = (response.result as unknown as string).substring(1);

                        // The decrypted memo is an encrypted string, so pass this to the server to get back refresh and access tokens
                        const token = await this.authService.verifyUserAuthMemo(response.data.username, signedKey) as string;

                        if (token) {
                            const signin = await firebase.auth().signInWithCustomToken(token);

                            const idToken = await this.authService.getIdToken();
                            console.log(idToken);

                            // Store the username, access token and refresh token
                            localStorage.setItem('username', signin.user.uid);
                        }

                        resolve({username, token});
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
                    const user = await getAccount(username);
    
                    if (user && user.length > 0) {
                        try {
                            if (steem.auth.wifToPublic(key) == user[0].memo_key || steem.auth.wifToPublic(key) === user[0].posting.key_auths[0][0]) {
                                // Get an encrypted memo only the user can decrypt with their private key
                                const encryptedMemo = await this.authService.getUserAuthMemo(username);

                                // Decrypt the private memo to get the encrypted string
                                const signedKey = steem.memo.decode(key, encryptedMemo).substring(1);

                                // The decrypted memo is an encrypted string, so pass this to the server to get back refresh and access tokens
                                const token = await this.authService.verifyUserAuthMemo(username, signedKey) as string;

                                if (token) {
                                    const signin = await firebase.auth().signInWithCustomToken(token);

                                    // Store the username, access token and refresh token
                                    localStorage.setItem('username', signin.user.uid);
                                }

                                resolve({username, token});
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
        firebase.auth().signOut();
        //dispatchify(logout)();
    }

    async loadPendingUnstakes(account) {
        var result: IPendingUnstakeTransaction[] = await this.ssc.find('tokens', 'pendingUnstakes', { account: account }, 1000, 0, '', false);        

        if (result != null) {
            result = result.map(o => {
                o.timestamp_string = moment.unix(o.nextTransactionTimestamp / 1000).format('YYYY-M-DD HH:mm:ss');
                return o;
            });
        }

        if (this.user && account === this.user.name) {
            this.user.pendingUnstakes = result;
        }
        
        return result;
    }

    async loadPendingUndelegations(account) {
        var result: IPendingUndelegationTransaction[] = await this.ssc.find('tokens', 'pendingUndelegations', { account: account }, 1000, 0, '', false);

        if (result != null) {
            result = result.map(o => {
                o.timestamp_string = moment.unix(o.completeTimestamp / 1000).format('YYYY-M-DD HH:mm:ss');
                return o;
            });
        }

        if (this.user && account === this.user.name) {                 
            this.user.pendingUndelegations = result;
        }

        return result;
    }

    async getScotUsertokens(account) {
        const tokens: IScotToken[] = [];
        if (!account && this.user) {
            account = this.user.name;
        }

        if (account) {
            const url = `${environment.SCOT_API}@${account}?`;
            const req = await this.request(url);            
            const results = await req.json();

            if (results) {
                for (const key in results) {
                    const token: IScotToken = results[key];
                    tokens.push(token);
                }
            }

            if (tokens) {
                this.user.scotTokens = tokens;
            }

            return tokens;
        }

        return [];
    }

    async claimToken(symbol: string) {
        let claimTokenResult = false;

        let username = this.user.name;                
        if (username === "")
            username = this.getUser();

        const scotToken = this.user.scotTokens.find(function (x) { return x.symbol === symbol });         
        const amount = scotToken.pending_token;
        const factor = Math.pow(10, scotToken.precision);
        const calculated = amount / factor;
        
        const claimData = {
			symbol
        };
        
        if (window && window.steem_keychain) {
            const response = await customJson(username, 'scot_claim_token', 'Posting', JSON.stringify(claimData),`Claim ${calculated} ${symbol.toUpperCase()} Tokens`);
            
            if (response.success && response.result) {
                claimTokenResult = true;
            }
        } else {
            steemConnectJsonId(this.user.name, 'posting', 'scot_claim_token', claimData, () => {
                // Hide loading
            });
        }

        return claimTokenResult;
    }

    async enableDelegation(symbol: string, undelegationCooldown: string): Promise<unknown> {
        return new Promise((resolve) => {
            // Show loading

            const username = localStorage.getItem('username');

            if (!username) {
                window.location.reload();
                return;
            }

            const transaction_data = {
                contractName: "tokens",
                contractAction: "enableDelegation",
                contractPayload: {
                    "symbol": symbol,
                    "undelegationCooldown": parseInt(undelegationCooldown, 10)
                }
            };

            if (window && window.steem_keychain) {
                steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Enable Token Delegation', async (response) => {

                    if (response.success && response.result) {
                        try {
                            await checkTransaction(response.result.id, 3);

                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('enableDelegationSucceeded', {
                                symbol,
                                undelegationCooldown,
                                ns: 'notifications'
                            });

                            this.toast.success(toast);

                            resolve(true);
                        } catch (e) {
                            // Show error toastr: 'An error occurred attempting to unstake tokens: ' + tx.error
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: e
                            });

                            this.toast.error(toast);

                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                });
            } else {
                steemConnectJson(this.user.name, 'active', transaction_data, () => {
                    resolve(true);
                });
            }
        });
    }

    async enableStaking(symbol, unstakingCooldown, numberTransactions): Promise<unknown> {
        return new Promise((resolve) => {
            // Show loading

            const username = localStorage.getItem('username');

            if (!username) {
                window.location.reload();
                return;
            }

            const transactionData = {
                contractName: 'tokens',
                contractAction: 'enableStaking',
                contractPayload: {
                    "symbol": symbol,
                    "unstakingCooldown": parseInt(unstakingCooldown, 10),
                    "numberTransactions": parseInt(numberTransactions, 10)
                }
            };

            if (window && window.steem_keychain) {
                steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transactionData), 'Enable Token Staking', async (response) => {

                    if (response.success && response.result) {
                        try {
                            await checkTransaction(response.result.id, 3);

                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('enableStakingSucceeded', {
                                symbol,
                                unstakingCooldown,
                                numberTransactions,
                                ns: 'notifications'
                            });

                            this.toast.success(toast);

                            resolve(true);
                        } catch (e) {
                            // Show error toastr: 'An error occurred attempting to unstake tokens: ' + tx.error
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: e
                            });

                            this.toast.error(toast);

                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                });
            } else {
                steemConnectJson(this.user.name, 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

    async stake(symbol: string, quantity: string, to: string): Promise<unknown> {
        return new Promise((resolve) => {
            // Show loading
            const username = localStorage.getItem('username');

            if (!username) {
                window.location.reload();
                return;
            }

            const transactionData = {
                contractName: "tokens",
                contractAction: "stake",
                contractPayload: {
                    "to": to,
                    "symbol": symbol,
                    "quantity": quantity
                }
            };

            if (window && window.steem_keychain) {
                steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transactionData), 'Stake Token', async (response) => {

                    if (response.success && response.result) {
                        try {
                            await checkTransaction(response.result.id, 3);

                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('stakingSucceeded', {
                                quantity,
                                symbol,
                                username,
                                ns: 'notifications'
                            });

                            this.toast.success(toast);

                            resolve(true);

                            // Show "Token successfully staked" toastr
                        } catch (e) {
                            // Show error toastr: 'An error occurred attempting to enable stake token: ' + tx.error
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: e
                            });

                            this.toast.error(toast);

                            // this.loadBalances(username).then(() => {
                            //     this.showHistory(symbol);
                            // });

                            resolve(false);
                        }
                    } else {
                        resolve(false);
                        // Hide loading
                    }                
                });
            } else {
                steemConnectJson(this.user.name, 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

    async unstake(symbol: string, quantity: string): Promise<unknown> {
        return new Promise((resolve) => {
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

            if (window && window.steem_keychain) {
                steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Unstake Token', async (response) => {

                if (response.success && response.result) {
                    try {
                        await checkTransaction(response.result.id, 3);

                        const toast = new ToastMessage();

                        toast.message = this.i18n.tr('unstakingSucceeded', {
                            quantity,
                            symbol,
                            username,
                            ns: 'notifications'
                        });

                        this.toast.success(toast);

                        resolve(true);

                        // Show "Tokens successfully unstaked" toastr
                    } catch (e) {
                        // Show error toastr: 'An error occurred attempting to unstake tokens: ' + tx.error
                        const toast = new ToastMessage();

                        toast.message = this.i18n.tr('errorSubmittedTransfer', {
                            ns: 'errors',
                            error: e
                        });

                        this.toast.error(toast);

                        resolve(false);
                    }
                } else {
                    resolve(false);                    
                }
                });
            } else {
                steemConnectJson(this.user.name, 'active', transaction_data, () => {
                    resolve(true);
                });
            }
        });
    }

    async cancelUnstake(txID): Promise<any> {
        return new Promise((resolve) => {
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
        
            if (window && window.steem_keychain) {
                steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Cancel Unstake Tokens', async (response) => {            
                    if (response.success && response.result) {
                        try {
                            await checkTransaction(response.result.id, 3);

                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('unstakeCancelled', {
                                ns: 'notifications'
                            });

                            this.toast.success(toast);

                            resolve(true);

                            // Show "Token unstaking cancelled" toastr
                        } catch (e) {
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: e
                            });

                            this.toast.error(toast);

                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                });
            } else {
                steemConnectJson(this.user.name, 'active', transaction_data, () => {
                    resolve(true);
                });
            }
        });
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

		getSteemPrice().then(() => {
			if(++loaded >= 3) {
                return this.params;
            }
		});
    }

    async sendToken(symbol: string, to: string, quantity: number, memo: string): Promise<any> {
        return new Promise((resolve) => {
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
              steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Token Transfer: ' + symbol, async (response) => {
                if (response.success && response.result) {
                    try {
                        await checkTransaction(response.result.id, 3);
                        
                        const toast = new ToastMessage();

                        toast.message = this.i18n.tr('tokensSent', {
                            quantity,
                            symbol,
                            to,
                            ns: 'notifications'
                        });
        
                        this.toast.success(toast);

                        resolve(true);
                    } catch (e) {
                        const toast = new ToastMessage();

                        toast.message = this.i18n.tr('errorSubmittedTransfer', {
                            ns: 'errors',
                            error: e
                        });
        
                        this.toast.error(toast);

                        // this.loadBalances(username).then(() => {
                        //     this.showHistory(symbol);
                        // });

                        resolve(false);
                    }
                } else {
                    resolve(false);
                    // hide
                }
              });
            } else {
                steemConnectJson(this.user.name, 'active', transaction_data, () => {
                    resolve(true);
                });
            }
        });
    }

    async getBalance(t) {
        let balanceVal = 0;
        
        if (this.user && this.user.balances) {
            const username = this.getUser();
            if (this.tokens.length == 0) {            
                const tokenResponse = await loadTokens();

                if (tokenResponse)
                    this.tokens = tokenResponse;                
            }    

            const userBalances = await this.userBalances(t, username);
            
            if (userBalances) {
                this.user.balances = userBalances;

                const token = this.user.balances.find(b => b.symbol === t);
                if (token)
                    balanceVal = parseFloat(token.balance);
            }

            return balanceVal;
        }
    }

    getToken(symbol: string) {
        return this.tokens.find(t => t.symbol === symbol);
    }

    getTokens() {
        return this.tokens;
    }

    async showHistory(symbol: string, username: string) {        
        try {
            const history = await this.request('/history?', {
                account: username,
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
    
    async buyBook(symbol, account?: string) {
        if (symbol == environment.PEGGED_TOKEN) {
            symbol = environment.NATIVE_TOKEN;
        }

        const token = this.getToken(symbol);

        if (token.metadata && token.metadata.hide_in_market) {
            return false;
        }

        if (!account) {
            return this.ssc.find('market', 'buyBook', { symbol: symbol }, 200, 0, [{ index: 'priceDesc', descending: true }], false);
        }

        return this.ssc.find('market', 'buyBook', { symbol, account }, 200, 0, [{ index: 'priceDesc', descending: true }], false);
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
            return this.ssc.find('market', 'sellBook', { symbol }, 200, 0, [{ index: 'priceDesc', descending: false }], false);
        }

        return this.ssc.find('market', 'sellBook', { 
            symbol, 
            account 
        }, 200, 0, [{ index: 'priceDesc', descending: false }], false);
    }
    
    async tradesHistory(symbol) {
        if (symbol == environment.PEGGED_TOKEN) {
            symbol = environment.NATIVE_TOKEN;
        }

        const token = this.getToken(symbol);

        if (token.metadata && token.metadata.hide_in_market) {
            return false;
        }

        return this.ssc.find('market', 'tradesHistory', { symbol: symbol }, 30, 0, [{ index: '_id', descending: false }], false);
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
    }

    async withdrawSteem(amount: string) {
        const username = localStorage.getItem('username');

        const transaction_data = {
			id: environment.CHAIN_ID,
			json: {
				"contractName": "steempegged",
				"contractAction": "withdraw",
				"contractPayload": {
                    "quantity": formatSteemAmount(amount)
                }
			}
        };

        if (window.steem_keychain) {
            const withdraw = await customJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transaction_data), 'Withdraw STEEM');

            if (withdraw && withdraw.success && withdraw.result) {
                
                try {

                    const toast = new ToastMessage();

                    toast.message = this.i18n.tr('withdrawSteemSuccess', {
                        ns: 'notifications',
                        from: username,
                        to: environment.STEEMP_ACCOUNT,
                        amount,
                        jsonData: JSON.stringify(transaction_data)
                    });
    
                    this.toast.success(toast);

                    return true;
                } catch (e) {
                    const toast = new ToastMessage();

                    toast.message = this.i18n.tr('withdrawSteemError', {
                        ns: 'notifications',
                        from: username,
                        to: environment.STEEMP_ACCOUNT,
                        amount,
                        jsonData: JSON.stringify(transaction_data)
                    });
    
                    this.toast.error(toast);
                }
            }
        } else {
            steemConnectJson(this.user.name, 'active', transaction_data, () => {
                return true;
            });
        }
    }

    depositSteem(amount: string) {
        return new Promise(async (resolve) => {
            const username = localStorage.getItem('username');

            const transaction_data = {
                id: environment.CHAIN_ID,
                json: {
                    "contractName": "steempegged",
                    "contractAction": "buy",
                    "contractPayload": { }
                }
            };
    
            if (window.steem_keychain) {
                const deposit = await requestTransfer(username, environment.STEEMP_ACCOUNT, amount, JSON.stringify(transaction_data), 'STEEM');
    
                if (deposit && deposit.success && deposit.result) {
                    try {
                        await checkTransaction(deposit.result.id, 3);

                        const toast = new ToastMessage();
    
                        toast.message = this.i18n.tr('depositSteemSuccess', {
                            from: username,
                            to: environment.STEEMP_ACCOUNT,
                            amount,
                            memo: JSON.stringify(transaction_data),
                            ns: 'notifications'
                        });
        
                        this.toast.success(toast);

                        resolve(true);
                    } catch (e) {
                        const toast = new ToastMessage();
    
                        toast.message = this.i18n.tr('depositSteemError', {
                            from: username,
                            to: environment.STEEMP_ACCOUNT,
                            amount,
                            memo: JSON.stringify(transaction_data),
                            ns: 'notifications'
                        });
        
                        this.toast.error(toast);

                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            } else {
                steemConnectTransfer(username, environment.STEEMP_ACCOUNT, `${amount} STEEM`, JSON.stringify(transaction_data), () => {
                    resolve(true);
                });
            }
        });
    }

    async getDepositAddress(symbol) {
        const tokenPairs = await this.getTokenPairs();
        const peggedToken = tokenPairs.find(p => p.symbol === symbol);

        if (!peggedToken) {
            return;
        }

        try {
            const userName = this.user.name != "" ? this.user.name : this.getUser();
            if (userName == null || userName == '')
                throw new Error("User is unknown");

            const request = await this.http.fetch(`${environment.CONVERTER_API}/convert/`, {
                method: 'POST',
                body: json({ from_coin: symbol, to_coin: peggedToken.pegged_token_symbol, destination: userName})
            });

            const response = await request.json();

            return {...response, ...peggedToken};
        } catch(e) {
            console.error(e);
            return null;
        }
    }

    async getWithdrawalAddress(symbol, address) {
        const tokenPairs = await this.getTokenPairs();
        const peggedToken = tokenPairs.find(p => p.symbol === symbol);

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

    async getTokenPairs() {
        const coins = await loadCoins();
        const coinPairs = await loadCoinPairs();

        let tokenPairs = [];
        const nonPeggedCoins = coins.filter(x => x.coin_type != "steemengine");

        // add steem as first item
        const steem = { name: 'STEEM', symbol: 'STEEM', pegged_token_symbol: 'STEEMP' };
        tokenPairs.push(steem);

        nonPeggedCoins.forEach(x => {
            // find pegged coin for each non-pegged coin
            const coinFound = coinPairs.find(y => y.from_coin_symbol == x.symbol);
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
        })

        // sort the coins
        tokenPairs = tokenPairs.sort((a, b) => a.name.localeCompare(b.name));        

        return tokenPairs;
    }

    async delegate(symbol: string, quantity: string, to: string): Promise<unknown> {
        return new Promise((resolve) => {
            // Show loading
            const username = localStorage.getItem('username');

            if (!username) {
                window.location.reload();
                return;
            }

            const transactionData = {
                contractName: "tokens",
                contractAction: "delegate",
                contractPayload: {
                    "to": to,
                    "symbol": symbol,
                    "quantity": quantity
                }
            };

            if (window && window.steem_keychain) {
                steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transactionData), 'Delegate Token', async (response) => {

                    if (response.success && response.result) {
                        try {
                            await checkTransaction(response.result.id, 3);

                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('delegateSucceeded', {
                                quantity,
                                symbol,
                                username,
                                ns: 'notifications'
                            });

                            this.toast.success(toast);

                            resolve(true);

                            // Show "Token successfully staked" toastr
                        } catch (e) {
                            // Show error toastr: 'An error occurred attempting to enable stake token: ' + tx.error
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: e
                            });

                            this.toast.error(toast);

                            // this.loadBalances(username).then(() => {
                            //     this.showHistory(symbol);
                            // });

                            resolve(false);
                        }
                    } else {
                        resolve(false);
                        // Hide loading
                    }
                });
            } else {
                steemConnectJson(this.user.name, 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

    async undelegate(symbol: string, quantity: string, from: string): Promise<unknown> {
        return new Promise((resolve) => {
            // Show loading
            const username = localStorage.getItem('username');

            if (!username) {
                window.location.reload();
                return;
            }

            const transactionData = {
                contractName: "tokens",
                contractAction: "undelegate",
                contractPayload: {
                    "from": from,
                    "symbol": symbol,
                    "quantity": quantity
                }
            };

            if (window && window.steem_keychain) {
                steem_keychain.requestCustomJson(username, environment.CHAIN_ID, 'Active', JSON.stringify(transactionData), 'Undelegate Token', async (response) => {

                    if (response.success && response.result) {
                        try {
                            await checkTransaction(response.result.id, 3);

                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('undelegateSucceeded', {
                                quantity,
                                symbol,
                                username,
                                ns: 'notifications'
                            });

                            this.toast.success(toast);

                            resolve(true);

                            // Show "Token successfully staked" toastr
                        } catch (e) {
                            // Show error toastr: 'An error occurred attempting to enable stake token: ' + tx.error
                            const toast = new ToastMessage();

                            toast.message = this.i18n.tr('errorSubmittedTransfer', {
                                ns: 'errors',
                                error: e
                            });

                            this.toast.error(toast);

                            // this.loadBalances(username).then(() => {
                            //     this.showHistory(symbol);
                            // });

                            resolve(false);
                        }
                    } else {
                        resolve(false);
                        // Hide loading
                    }
                });
            } else {
                steemConnectJson(this.user.name, 'active', transactionData, () => {
                    resolve(true);
                });
            }
        });
    }

}
