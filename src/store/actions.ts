import { State, ISettings } from './state';
import store from './store';

import firebase from 'firebase/app';
import { log } from 'services/log';
import { loadBalances, loadTokens, loadExchangeUiLoggedIn, loadExchangeUiLoggedOut, parseTokens } from 'common/steem-engine';
import { ssc } from 'common/ssc';
import moment from 'moment';

export function loading(state: State, boolean: boolean) {
    const newState = { ...state };

    newState.loading = Boolean(boolean);

    return newState;
}

export function login(state: State, username: string): State {
    const newState = { ...state };

    newState.account.name = username;

    newState.loggedIn = true;

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
        notifications: []
    };

    newState.loggedIn = false;

    return newState;
}

export function setAccount(state: State, account: Partial<State['account']>): State {
    const newState = { ...state };

    newState.account = Object.assign(newState.account, account);

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

            newState.firebaseUser.notifications = newState.firebaseUser.notifications.filter(notification => !notification.read);

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
        }
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadSiteSettings(state: State): Promise<State> {
    const newState = { ...state };

    try {
        const settings = await firebase.firestore().collection('admin').doc('settings').get();

        newState.settings = settings.data() as ISettings;
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
        newState.account.balances = await loadBalances(newState.account.name);
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadBuyBook(state: State, symbol: string, account: string = undefined): Promise<State> {
    const newState = { ...state };

    try {

        const buyBook = await ssc.find('market', 'buyBook', { symbol, account }, 200, 0, [{ index: 'priceDec', descending: true }], false);

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

        const sellBook = await ssc.find(
            'market',
            'sellBook',
            { symbol, account },
            200,
            0,
            [{ index: 'priceDec', descending: false }],
            false
        );


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
        const tradeHistory = await ssc.find('market', 'tradesHistory', { symbol, account }, 30, 0, [{ index: '_id', descending: true }], false);                
        
        newState.tradeHistory = tradeHistory.map(o => {
            o.total = o.price * o.quantity;
            o.timestamp_string = moment
                .unix(o.timestamp)
                .format('YYYY-M-DD HH:mm:ss');
            return o;
        });
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadTokensList(state: State): Promise<State> {
    const newState = { ...state };

    try {
        newState.tokens = await loadTokens();
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
                o.timestamp_string = moment
                    .unix(o.timestamp)
                    .format('YYYY-M-DD HH:mm:ss');
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

            newState.tradeHistory = data.tradesHistory.map((o: { total: number; price: number; quantity: number; timestamp_string: string; timestamp: number; }) => {
                o.total = o.price * o.quantity;
                o.timestamp_string = moment
                    .unix(o.timestamp)
                    .format('YYYY-M-DD HH:mm:ss');
                return o;
            });
        }
    } catch (e) {
        console.log(e);
    }

    return newState;
}

export async function markNotificationsRead(state: State) {
    const newState = { ...state };

    if (newState.loggedIn) {
        const userRef = firebase.firestore().collection('users').doc(newState.account.name);

        newState.firebaseUser.notifications = newState.firebaseUser.notifications.map(notification => {
            notification.read = true;
    
            return notification;
        });
    
        userRef.update({ notifications: newState.firebaseUser.notifications });
    }

    return newState;
}

store.registerAction('loading', loading);
store.registerAction('login', login);
store.registerAction('logout', logout);
store.registerAction('loadSiteSettings', loadSiteSettings);
store.registerAction('setAccount', setAccount);
store.registerAction('setTokens', setTokens);
store.registerAction('getCurrentFirebaseUser', getCurrentFirebaseUser);
store.registerAction('loadAccountBalances', loadAccountBalances);
store.registerAction('loadTokensList', loadTokensList);
store.registerAction('loadBuyBook', loadBuyBook);
store.registerAction('loadSellBook', loadSellBook);
store.registerAction('loadTradeHistory', loadTradeHistory);
store.registerAction('exchangeData', exchangeData);
store.registerAction('markNotificationsRead', markNotificationsRead);
