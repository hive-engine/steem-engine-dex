import { State } from "./state";
import store, { getCurrentState } from "./store";

import firebase from "firebase/app";
import { log } from "services/log";
import { loadBalances, loadTokens } from "common/steem-engine";
import { ssc } from "common/ssc";
import moment from "moment";

export function loading(state: State, boolean: boolean) {
    const newState = { ...state };

    newState.loading = Boolean(boolean);

    return newState;
}

export function login(state: State, username: string): State {
    let newState = { ...state };

    newState.account.name = username;

    newState.loggedIn = true;

    return newState;
}

export function logout(state: State): State {
    const newState = { ...state };

    newState.account = {
        name: "",
        account: {},
        balances: [],
        scotTokens: [],
        pendingUnstakes: []
    };

    newState.loggedIn = false;

    return newState;
}

export function setAccount(
    state: State,
    account: Partial<State["account"]>
): State {
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

    try {
        const doc = await firebase
            .firestore()
            .collection("users")
            .doc(newState.account.name)
            .get();

        if (doc.exists) {
            newState.firebaseUser = doc.data();

            if (newState.firebaseUser.favourites) {
                newState.account.balances.map((token: any) => {
                    if (
                        newState.firebaseUser.favourites.includes(token.symbol)
                    ) {
                        token.isFavourite = true;
                    } else {
                        token.isFavourite = false;
                    }

                    return token;
                });
            }
        }
    } catch (e) {
        console.log(newState);
        log.error(e);
    }

    return newState;
}

export async function loadAccountBalances(state: State): Promise<State> {
    const newState = { ...state };

    try {
        newState.account.balances = await loadBalances(newState.account.name);
    } catch (e) {
        log.error(e);
    }

    return newState;
}

export async function loadBuyBook(
    state: State,
    symbol: string,
    account: string = undefined
): Promise<State> {
    const newState = { ...state };

    try {
        const buyBook = await ssc.find(
            "market",
            "buyBook",
            { symbol, account },
            200,
            0,
            [{ index: "priceDec", descending: true }],
            false
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

export async function loadSellBook(
    state: State,
    symbol: string,
    account: string = undefined
): Promise<State> {
    const newState = { ...state };

    try {
        const sellBook = await ssc.find(
            "market",
            "sellBook",
            { symbol, account },
            200,
            0,
            [{ index: "priceDec", descending: false }],
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

export async function loadTradeHistory(
    state: State,
    symbol: string,
    account: string = undefined
): Promise<State> {
    const newState = { ...state };

    try {
        const tradeHistory = await ssc.find(
            "market",
            "tradesHistory",
            { symbol, account },
            30,
            0,
            [{ index: "_id", descending: false }],
            false
        );
        newState.tradeHistory = tradeHistory.map(o => {
            o.total = o.price * o.quantity;
            o.timestamp_string = moment
                .unix(o.timestamp)
                .format("YYYY-M-DD HH:mm:ss");
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

store.registerAction("loading", loading);
store.registerAction("login", login);
store.registerAction("logout", logout);
store.registerAction("setAccount", setAccount);
store.registerAction("setTokens", setTokens);
store.registerAction("getCurrentFirebaseUser", getCurrentFirebaseUser);
store.registerAction("loadAccountBalances", loadAccountBalances);
store.registerAction("loadTokensList", loadTokensList);
store.registerAction("loadBuyBook", loadBuyBook);
store.registerAction("loadSellBook", loadSellBook);
store.registerAction("loadTradeHistory", loadTradeHistory);
