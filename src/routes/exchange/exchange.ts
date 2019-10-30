
import { I18N } from 'aurelia-i18n';
import { ToastMessage, ToastService } from '../../services/toast-service';
import { BootstrapFormRenderer } from '../../resources/bootstrap-form-renderer';
import { SteemEngine } from '../../services/steem-engine';
import { autoinject, computedFrom, observable } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationController, ValidationRules, ControllerValidateResult } from 'aurelia-validation';

import styles from './exchange.module.css'
import { environment } from 'environment';
import moment from 'moment';
import { find, uniq, fill } from 'lodash';

import { loadTokenMarketHistory } from 'common/steem-engine';

import { DepositModal } from 'modals/deposit';
import { WithdrawModal } from 'modals/withdraw';
import { MarketOrderModal } from 'modals/market-order';

import { DialogService } from 'aurelia-dialog';
import { percentageOf } from 'common/functions';
import { loadTokensList, loadAccountBalances, loadBuyBook, loadSellBook, loadTradeHistory } from 'store/actions';
import { dispatchify } from 'aurelia-store';
import { getStateOnce } from 'store/store';
import * as d3 from 'd3';
import { DateTime } from 'luxon';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';

interface IOrderDataDisplay {
    labels: [];
    dataset: [];
}


@autoinject()
export class Exchange {
    private environment = environment;
    private controller: ValidationController;
    private renderer: BootstrapFormRenderer;
    @observable({ changeHandler: "currentTokenChanged" })
    private currentToken: string;
    private data;
    private styles = styles;
    private tokenData;
    private chartData: any = {};
    private eventAggregator: EventAggregator;
    private subscriber: Subscription;

    private userTokenBalance = [];
    private sellBook = [];
    private bestSellPrice = null;
    private buyBook = [];
    private tradeHistory = [];
    private userBuyOrders = [];
    private userSellOrders = [];
    private userOrders = [];

    private loadingUserBuyBook = false;
    private loadingUserSellBook = false;
    private loadingUserBalances = false;

    private steempBalance = 0;
    private tokenBalance = 0;
    private orderDataSetLength = 0;

    private currentExchangeMode = "buy";
    private bidQuantity = "";
    private bidPrice = "";

    constructor(
        private se: SteemEngine,
        private dialogService: DialogService,
        private i18n: I18N,
        private controllerFactory: ValidationControllerFactory,
        private toast: ToastService,
        private ea: EventAggregator) {
        this.controller = controllerFactory.createForCurrentScope();
       
        this.renderer = new BootstrapFormRenderer();
        this.controller.addRenderer(this.renderer);
        this.eventAggregator = ea;
    }

    async activate({ symbol }) {
        this.currentToken = symbol;

        await dispatchify(loadTokensList)();
        await dispatchify(loadAccountBalances)();
        await dispatchify(loadBuyBook)(symbol);
        await dispatchify(loadSellBook)(symbol);
        await dispatchify(loadTradeHistory)(symbol);

        const state = await getStateOnce();

        this.tokenData = state.tokens
            .filter(t => t.symbol !== "STEEMP")
            .filter(t => t.metadata && !t.metadata.hide_in_market);

        this.data = this.tokenData.find(t => t.symbol === symbol);

        if (state.sellBook.length) {
            this.bestSellPrice = state.sellBook[0];
        }        

        const buyOrderDisplayData = await this.loadBuyOrders(state);
        const sellOrderDisplayData = await this.loadSellOrders(state);


        await this.loadTokenHistoryData(state, buyOrderDisplayData, sellOrderDisplayData);     
    }   

    async loadTokenHistoryData(state, buyOrderDisplayData, sellOrderDisplayData) {
        this.tradeHistory = state.tradeHistory;


        const tokenHistory = await loadTokenMarketHistory(this.currentToken);
        var limitCandleStick = 60;

        var candleStickData = tokenHistory.slice(0, limitCandleStick).map(x => {
            return {

                t: moment.unix(x.timestamp).format('YYYY-MM-DD HH:mm:ss'),//x.timestamp * 1000,

                o: x.openPrice,
                h: x.highestPrice,
                l: x.lowestPrice,
                c: x.closePrice

            }

        });

        this.chartData = {
            labels: buyOrderDisplayData.labels.concat(sellOrderDisplayData.labels),
            datasets: [
                {

                    label: 'Buy',
                    steppedLine: 'after',
                    borderColor: '#88e86b',
                    backgroundColor: '#a9ea96',
                    data: buyOrderDisplayData.dataset
                },
                {
                    label: 'Sell',
                    steppedLine: 'before',
                    borderColor: '#e45858',
                    backgroundColor: '#e87f7f',
                    data: sellOrderDisplayData.dataset
                }
            ],
            ohlcData: candleStickData
        };   
    }

    async loadSellOrders(state) {
        this.sellBook = state.sellBook;
        let sellOrderLabels = uniq(this.sellBook.map(o => parseFloat(o.price)));
        let sellOrderDataset = fill(Array(this.orderDataSetLength), null);
        let sellOrderCurrentVolume = 0;
        sellOrderLabels.forEach(label => {
            let matchingSellOrders = this.sellBook.filter(o => parseFloat(o.price) === label);

            if (matchingSellOrders.length === 0) {
                sellOrderDataset.push(null);
            } else {
                sellOrderCurrentVolume = sellOrderCurrentVolume + matchingSellOrders.reduce((acc, val) => acc + parseFloat(val.quantity), 0);
                sellOrderDataset.push(sellOrderCurrentVolume);
            }
        });

        return <IOrderDataDisplay>{ dataset: sellOrderDataset, labels: sellOrderLabels };
    }

    async loadBuyOrders(state) {
        this.buyBook = state.buyBook;

        let buyOrderLabels = uniq(this.buyBook.map(o => parseFloat(o.price)));
        let buyOrderDataset = [];
        let buyOrderCurrentVolume = 0;
        buyOrderLabels.forEach(label => {
            let matchingBuyOrders = this.buyBook.filter(o => parseFloat(o.price) === label);

            if (matchingBuyOrders.length === 0) {
                buyOrderDataset.push(null);
            } else {
                buyOrderCurrentVolume = buyOrderCurrentVolume + matchingBuyOrders.reduce((acc, val) => acc + parseFloat(val.quantity), 0);
                buyOrderDataset.push(buyOrderCurrentVolume);
            }
        });
        buyOrderLabels.reverse();
        buyOrderDataset.reverse();

        this.orderDataSetLength = buyOrderDataset.length;
        return <IOrderDataDisplay>{ dataset: buyOrderDataset, labels: buyOrderLabels };

    }

    loadUserExchangeData() {
        const symbol = this.currentToken;
        const account = this.se.getUser();

        if (account) {
            this.loadingUserBuyBook = true;
            this.loadingUserSellBook = true;
            this.loadingUserBalances = true;

            this.se.ssc
                .find(
                    "market",
                    "buyBook",
                    { symbol: symbol, account: account },
                    100,
                    0,
                    [{ index: "_id", descending: true }],
                    false
                )
                .then(result => {
                    this.loadingUserBuyBook = false;

                    this.userBuyOrders = result.map(o => {
                        o.type = "buy";
                        o.total = o.price * o.quantity;
                        o.timestamp_string = moment
                            .unix(o.timestamp)
                            .format("YYYY-M-DD HH:mm:ss");
                        return o;
                    });

                    this.se.ssc
                        .find(
                            "market",
                            "sellBook",
                            { symbol: symbol, account: account },
                            100,
                            0,
                            [{ index: "_id", descending: true }],
                            false
                        )
                        .then(result => {
                            this.loadingUserSellBook = false;

                            this.userSellOrders = result.map(o => {
                                o.type = "sell";
                                o.total = o.price * o.quantity;
                                o.timestamp_string = moment
                                    .unix(o.timestamp)
                                    .format("YYYY-M-DD HH:mm:ss");
                                return o;
                            });

                            this.userOrders = this.userBuyOrders.concat(
                                this.userSellOrders
                            );
                            this.userOrders.sort(
                                (a, b) => b.timestamp - a.timestamp
                            );
                        });
                });

            this.se.ssc
                .find(
                    "tokens",
                    "balances",
                    { account: account, symbol: { $in: [symbol, "STEEMP"] } },
                    2,
                    0,
                    "",
                    false
                )
                .then(result => {
                    this.loadingUserBalances = false;

                    if (result) {
                        for (const token of result) {
                            if (token.symbol === "STEEMP") {
                                this.steempBalance = token.balance;
                            }

                            if (token.symbol === symbol) {
                                this.tokenBalance = token.balance;
                            }
                        }
                    }

                    this.userTokenBalance.push(
                        find(result, balance => balance.symbol === symbol)
                    );
                    this.userTokenBalance.push(
                        find(result, balance => balance.symbol === "STEEMP")
                    );
                });
        }
    }

    currentTokenChanged(newValue, oldValue) {
        this.loadUserExchangeData();
    }


    async attached() {
        this.loadUserExchangeData();        

        this.subscriber = this.eventAggregator.subscribe('eventReload', response => {
            this.catchReloadEvent(response);
        })
    }

    async catchReloadEvent(response) {                
        var data = <IReloadEventData>(response.data);
        if (data.reloadBuyBook) {            
            await dispatchify(loadBuyBook)(this.currentToken);

            // fetch state after reloading 
            const state = await getStateOnce();
            await this.loadBuyOrders(state);
        }
        if (data.reloadSellBook) {
            await dispatchify(loadSellBook)(this.currentToken);

            // fetch state after reloading 
            const state = await getStateOnce();            
            await this.loadSellOrders(state);
        }

        if (data.reloadUserExchangeData) {            
            this.loadUserExchangeData();
        }
    }

    detached() {
        this.subscriber.dispose();

    }

    deposit() {
        this.dialogService
            .open({ viewModel: DepositModal })
            .whenClosed(response => {
                console.log(response);
            });
    }

    withdraw() {
        this.dialogService
            .open({ viewModel: WithdrawModal })
            .whenClosed(response => {
                console.log(response);
            });
    }

    confirmMarketOrder() {
        const order = {
            symbol: this.data.symbol,
            type: this.currentExchangeMode,
            quantity: this.bidQuantity,
            price: this.bidPrice
        };

        this.dialogService
            .open({ viewModel: MarketOrderModal, model: order })
            .whenClosed(response => {
                console.log(response);
            });
    }

    /**
     * Method for calculating how much a user can buy/sell
     * given their current STEEMP or TOKEN balance
     * @param amount
     */
    amountSelect(amount: string) {
        console.log(amount);
        const actualAmount = parseInt(amount);
        const userSteem = this.steempBalance;
        const userTokenBalance = this.userTokenBalance;
        const buyBook = this.buyBook;
        const sellBook = this.sellBook;

        // Determine what the user can buy from the buy book
        if (this.currentExchangeMode === "buy") {
            let totalTokens = 0;
            let totalSteemp = 0;

            const amount = percentageOf(actualAmount, userSteem);

            if (sellBook) {
                for (const order of sellBook) {
                    // Total is total STEEMP, price is price per 1 quantity and quantity is amount
                    // Total = quantity * price
                    const { total, price, quantity } = order;

                    // Order total STEEM is greater than user balance
                    if (total > amount) {
                        this.bidPrice = price;

                        while (totalSteemp < amount) {
                            totalTokens += 0.00000001;
                            totalSteemp += 0.00000001 * price;
                        }

                        this.bidQuantity = totalTokens.toFixed(3);

                        // Stop the loop, we don't need to go further
                        break;
                    } else {
                    }
                }
            }
        }
        // Determine what the user can set the price at to sell all of their token
        else {
        }
    }

    @computedFrom("bidPrice", "bidQuantity")
    get totalMarketBalance() {
        const total = parseFloat(this.bidPrice) * parseFloat(this.bidQuantity);
        return !isNaN(total) ? total.toFixed(4) : 0;
    }
}
