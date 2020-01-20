import { Container } from 'aurelia-framework';
import { NftService } from './../services/nft-service';
/* eslint-disable no-undef */
import { initialState } from './state';
import { query } from 'common/apollo';
import store from './store';

import firebase from 'firebase/app';
import { log } from 'services/log';
import {
    loadUserBalances,
    loadTokens,
    loadExchangeUiLoggedIn,
    loadExchangeUiLoggedOut,
    parseTokens,
    loadConversionSentReceived,
} from 'common/steem-engine';
import { ssc } from 'common/ssc';
import moment from 'moment';

const nftService: NftService = Container.instance.get(NftService);

export function loading(state: State, boolean: boolean) {
    const newState = { ...state };

    newState.loading = Boolean(boolean);

    return newState;
}

export function login(state: State, username: string): State {
    const newState = { ...state };

    if (newState?.account) {
        newState.account.name = username;

        newState.loggedIn = true;
    } else {
        const copiedInitialsTate = { ...initialState };

        newState.account = copiedInitialsTate.account;
        newState.account.name = username;
        newState.loggedIn = true;
    }

    return newState;
}

export function logout(state: State): State {
    const newState = { ...state };

    newState.account = {
        name: '',
        token: {},
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: [],
        notifications: [],
        nfts: [],
    };

    newState.loggedIn = false;

    return newState;
}

export function setAccount(state: State, account: Partial<State['account']>): State {
    const newState = { ...state };

    if (newState?.account) {
        newState.account = Object.assign(newState.account, account);
    }

    return newState;
}

export function setTokens(state: State, tokens: any[]): State {
    const newState = { ...state };

    newState.tokens = tokens;

    return newState;
}

export async function getCurrentFirebaseUser(state: State): Promise<State> {
    const newState = { ...state };

    if (!newState.loggedIn) {
        return newState;
    }

    try {
        const doc = await firebase
            .firestore()
            .collection('users')
            .doc(newState.account.name)
            .get();

        if (doc.exists) {
            newState.firebaseUser = doc.data();

            if (newState.firebaseUser.notifications) {
                newState.firebaseUser.notifications = newState.firebaseUser.notifications.filter(
                    notification => !notification.read,
                );
            }

            // eslint-disable-next-line no-undef
            if (newState?.firebaseUser?.favourites) {
                newState.account.balances.map((token: any) => {
                    if (newState.firebaseUser.favourites.includes(token.symbol)) {
                        token.isFavourite = true;
                    } else {
                        token.isFavourite = false;
                    }

                    return token;
                });
            }

            if (!newState?.firebaseUser?.bank) {
                newState.firebaseUser.bank = {
                    name: '',
                    code: '',
                    accountName: '',
                    address: '',
                    swift: '',
                    accountNumber: ''
                };
            }

            if (!newState?.firebaseUser?.residency) {
                newState.firebaseUser.residency = {
                    document1Rejected: false,
                    document2Rejected: false,
                    document1RejectionReason: '',
                    document2RejectionReason: '',
                    document1Verified: false,
                    document2Verified: false,
                    document1Pending: false,
                    document2Pending: false
                };
            }
        }
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadAccountBalances(state: State): Promise<State> {
    const newState = { ...state };

    if (!newState.loggedIn) {
        return newState;
    }

    try {
        newState.account.balances = await loadUserBalances(newState.account.name);
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadBuyBook(state: State, symbol: string, account: string = undefined): Promise<State> {
    const newState = { ...state };

    try {
        const buyBook = await ssc.find(
            'market',
            'buyBook',
            { symbol, account },
            200,
            0,
            [{ index: 'priceDec', descending: true }],
            false,
        );

        newState.buyBook = buyBook.map(o => {
            newState.buyTotal += o.quantity * o.price;
            o.total = newState.buyTotal;
            o.amountLocked = o.quantity * o.price;
            return o;
        });
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadSellBook(state: State, symbol: string, account: string = undefined): Promise<State> {
    const newState = { ...state };

    try {
        const params: any = { };

        if (symbol) {
            params.symbol = symbol;
        }

        if (account) {
            params.account = account;
        }

        const sellBook: any[] = await ssc.find('market', 'sellBook', params, 200, 0, [{ index: 'priceDec', descending: true }], false);

        // re-order sellbook results to match the buybook results
        newState.sellBook = sellBook.map(o => {
            newState.sellTotal += o.quantity * o.price;
            o.total = newState.sellTotal;
            o.amountLocked = o.quantity * o.price;
            return o;
        });
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadTradeHistory(state: State, symbol: string, account: string = undefined): Promise<State> {
    const newState = { ...state };

    try {
        const tradeHistory = await ssc.find(
            'market',
            'tradesHistory',
            { symbol, account },
            100,
            0,
            [{ index: '_id', descending: true }],
            false,
        );

        newState.tradeHistory = tradeHistory.map(o => {
            o.total = o.price * o.quantity;
            o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
            return o;
        });
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadTokensList(state: State, limit = 1000, offset = 0): Promise<State> {
    const newState = { ...state };

    try {
        const tokens: IToken[] = await loadTokens([], limit, offset);

        if (tokens.length) {
            newState.tokensLoaded = false;
            newState.tokens = tokens;
        } else {
            newState.tokensLoaded = true;
        }
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadTokenSymbols(state: State, symbols = [], limit = 50, offset = 0): Promise<State> {
    const newState = { ...state };

    try {
        newState.tokens = await loadTokens(symbols, limit, offset);
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadConversionHistory(state: State, account: string = undefined): Promise<State> {
    const newState = { ...state };

    try {
        const conversionSentReceived = await loadConversionSentReceived(account);
        const conversionHistory = [
            ...conversionSentReceived.conversionSent.results,
            ...conversionSentReceived.conversionReceived.results,
        ];

        // sort by date
        conversionHistory.sort((a, b) => (a.created_at > b.created_at ? -1 : b.created_at > a.created_at ? 1 : 0));

        newState.conversionHistory = conversionHistory;
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function exchangeData(state: State, symbol: string): Promise<State> {
    const newState = { ...state };

    try {
        if (newState.loggedIn) {
            const data = await loadExchangeUiLoggedIn(newState.account.name, symbol);

            newState.tokens = parseTokens(data) as any;

            newState.account.balances = data.userBalances;

            newState.buyBook = data.buyBook.map(o => {
                newState.buyTotal += o.quantity * o.price;
                o.total = newState.buyTotal;
                o.amountLocked = o.quantity * o.price;
                return o;
            });

            newState.sellBook = data.sellBook.map(o => {
                newState.sellTotal += o.quantity * o.price;
                o.total = newState.sellTotal;
                o.amountLocked = o.quantity * o.price;
                return o;
            });

            newState.tradeHistory = data.tradesHistory.map(o => {
                o.total = o.price * o.quantity;
                o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
                return o;
            });
        } else {
            const data = await loadExchangeUiLoggedOut(symbol);

            newState.tokens = parseTokens(data) as any;

            newState.buyBook = data.buyBook.map(o => {
                newState.buyTotal += o.quantity * o.price;
                o.total = newState.buyTotal;
                o.amountLocked = o.quantity * o.price;
                return o;
            });

            newState.sellBook = data.sellBook.map(o => {
                newState.sellTotal += o.quantity * o.price;
                o.total = newState.sellTotal;
                o.amountLocked = o.quantity * o.price;
                return o;
            });

            newState.tradeHistory = data.tradesHistory.map(
                (o: {
                    total: number;
                    price: number;
                    quantity: number;
                    timestamp_string: string;
                    timestamp: number;
                }) => {
                    o.total = o.price * o.quantity;
                    o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
                    return o;
                },
            );
        }
    } catch (e) {
        console.log(e);
    }

    return newState;
}

export async function markNotificationsRead(state: State) {
    const newState = { ...state };

    if (newState.loggedIn) {
        const userRef = firebase
            .firestore()
            .collection('users')
            .doc(newState.account.name);

        if (newState.firebaseUser.notifications) {
            newState.firebaseUser.notifications = newState.firebaseUser.notifications.map(notification => {
                notification.read = true;

                return notification;
            });

            userRef.update({ notifications: newState.firebaseUser.notifications });
        }
    }

    return newState;
}

export async function getPendingWithdrawals(state: State) {
    const newState = { ...state };

    if (newState.loggedIn) {
        const {
            data: { pendingWithdrawals },
        } = (await query(
            `query { pendingWithdrawals(account: "${newState.account.name}") { memo, quantity, type } }`,
        )) as any;

        newState.pendingWithdrawals = pendingWithdrawals;
    }

    return newState;
}

export async function getNfts(state: State): Promise<State> {
    const newState = { ...state };

    const nfts = await nftService.loadNfts(null);

    for (const nft of nfts) {
        const exists = await nftService.sellBookExists(nft.symbol);

        (nft as any).marketEnabled = exists;
        
        if (nft.authorizedIssuingAccounts && nft.authorizedIssuingAccounts.includes(newState.account.name) && !(nft as any).groupBy.length) {
            (nft as any).userCanEnableMarket = true;
        } else {
            (nft as any).userCanEnableMarket = false;
        }
    }

    newState.nfts = nfts;

    return newState;
}



export async function getNftsWithSellBook(state: State): Promise<State> {
    const newState = { ...state };

    const nfts = await nftService.loadNfts(null);

    for (const nft of nfts) {
        const orders = await nftService.loadSellBook(nft.symbol, null);
        (nft as any).orders = orders;
    }

    newState.nfts = nfts;

    return newState;
}

export async function getNft(state: State, symbol: string): Promise<State> {
    const newState = { ...state };

    const nft = await nftService.loadNft(symbol);
    const orders = await nftService.loadSellBook(symbol, null);

    (nft as any).orders = orders;

    newState.nft = nft;

    return newState;
}

export async function getNftSellBook(state: State, symbol: string): Promise<State> {
    const newState = { ...state };

    const nftSellBook = await nftService.loadSellBook(symbol, null);

    newState.nftSellBook = nftSellBook;

    return newState;
}

export async function getNftInstance(state: State, symbol: string): Promise<State> {
    const newState = { ...state };

    const instances = await nftService.loadInstances(symbol, null);

    newState.instances = instances;

    return newState;
}

export async function getUserNfts(state: State): Promise<State> {
    const newState = { ...state };

    if (newState.loggedIn) {
        const userNfts = await nftService.loadUserNfts(newState.account.name);

        for (const nft of userNfts) {
            const exists = await nftService.sellBookExists(nft.symbol);

            (nft as any).marketEnabled = exists;
            
            if (nft.authorizedIssuingAccounts && nft.authorizedIssuingAccounts.includes(newState.account.name) && !exists) {
                (nft as any).userCanEnableMarket = true;
            } else {
                (nft as any).userCanEnableMarket = false;
            }
        }

        newState.account.nfts = userNfts;
    }

    return newState;
}

store.registerAction('loading', loading);
store.registerAction('login', login);
store.registerAction('logout', logout);
store.registerAction('setAccount', setAccount);
store.registerAction('setTokens', setTokens);
store.registerAction('getCurrentFirebaseUser', getCurrentFirebaseUser);
store.registerAction('loadAccountBalances', loadAccountBalances);
store.registerAction('loadTokensList', loadTokensList);
store.registerAction('loadTokenSymbols', loadTokenSymbols);
store.registerAction('loadBuyBook', loadBuyBook);
store.registerAction('loadSellBook', loadSellBook);
store.registerAction('loadTradeHistory', loadTradeHistory);
store.registerAction('exchangeData', exchangeData);
store.registerAction('markNotificationsRead', markNotificationsRead);
store.registerAction('getPendingWithdrawals', getPendingWithdrawals);
store.registerAction('loadConversionHistory', loadConversionHistory);
store.registerAction('getNfts', getNfts);
store.registerAction('getNftsWithSellBook', getNftsWithSellBook);
store.registerAction('getNft', getNft);
store.registerAction('getNftSellBook', getNftSellBook);
store.registerAction('getNftInstance', getNftInstance);
store.registerAction('getUserNfts', getUserNfts);
