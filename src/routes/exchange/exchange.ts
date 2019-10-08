import { I18N } from 'aurelia-i18n';
import { ToastMessage, ToastService } from '../../services/toast-service';
import { BootstrapFormRenderer } from '../../resources/bootstrap-form-renderer';
import { SteemEngine } from '../../services/steem-engine';
import { autoinject, computedFrom } from 'aurelia-framework';
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

@autoinject()
export class Exchange {
    private environment = environment;
    private controller: ValidationController;
    private renderer: BootstrapFormRenderer;
    private currentToken: string;
    private data;
    private styles = styles;
    private tokenData;
    private chartData: any = {};

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

    private currentExchangeMode = 'buy';
    private bidQuantity = '';
    private bidPrice = '';

    constructor(private se: SteemEngine,
        private dialogService: DialogService,
        private i18n: I18N,
        private controllerFactory: ValidationControllerFactory,
        private toast: ToastService) {
        this.controller = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.controller.addRenderer(this.renderer);
    }

    async activate({ symbol }) {
        this.currentToken = symbol;

        await dispatchify(loadTokensList)();
        await dispatchify(loadAccountBalances)();
        await dispatchify(loadBuyBook)(symbol);
        await dispatchify(loadSellBook)(symbol);
        await dispatchify(loadTradeHistory)(symbol);

        const state = await getStateOnce();

        this.tokenData = state.tokens.filter(t => t.symbol !== 'STEEMP')
            .filter(t => t.metadata && !t.metadata.hide_in_market);

        this.data = this.tokenData.find(t => t.symbol === symbol);

        if (state.sellBook.length) {
            this.bestSellPrice = state.sellBook[0];
        }

        this.buyBook = state.buyBook;
        this.sellBook = state.sellBook;
        this.tradeHistory = state.tradeHistory;

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

        let sellOrderLabels = uniq(this.sellBook.map(o => parseFloat(o.price)));
        let sellOrderDataset = fill(Array(buyOrderDataset.length), null);
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

        const tokenHistory = await loadTokenMarketHistory(this.currentToken);
        console.log('History', tokenHistory);

        this.chartData = {
            labels: buyOrderLabels.concat(sellOrderLabels),
            datasets: [
                {
                    label: 'Buy',
                    steppedLine: 'after',
                    borderColor: '#88e86b',
                    backgroundColor: '#a9ea96',
                    data: buyOrderDataset
                },
                {
                    label: 'Sell',
                    steppedLine: 'before',
                    borderColor: '#e45858',
                    backgroundColor: '#e87f7f',
                    data: sellOrderDataset
                }
            ],
            ohlcData: this.convertToOHLC(this.tradeHistory)
        };
        console.log('ohlc');
        console.log(this.chartData.ohlcData);
    }

    convertToOHLC2(data) {
        var parsedData = data,//JSON.parse(data),
            pointStart,
            range = [],
            low,
            high,
            ranges = [],
            dataOHLC = [],
            interval = 60 * 60; //

        parsedData.sort(function (a, b) {
            return a.timestamp - b.timestamp
        });

        pointStart = parsedData[0].timestamp;

        var pointStartDT = moment.unix(pointStart).format('YYYY-M-DD HH:mm:ss');
        var startInterval = pointStart + interval;
        var intervalDT = moment.unix(startInterval).format('YYYY-M-DD HH:mm:ss');

        $.each(parsedData, function (i, el) {            
            var startIntervaldt = moment.unix(startInterval).format('YYYY-M-DD HH:mm:ss');
            
            if (el.timestamp < pointStart + interval) {                
                range.push(el);                
            } else {                
                ranges.push(range.slice());
                range = [];
                range.push(el);
                pointStart = pointStart + interval;
            }

            if (i === parsedData.length - 1) {
                ranges.push(range);
            }
        });

        $.each(ranges, function (i, range) {
            low = range[0].price;
            high = range[0].price;

            $.each(range, function (i, el) {
                low = Math.min(low, el.price);
                high = Math.max(high, el.price);
            });

            dataOHLC.push({
                t: range[0].timestamp,
                o: Number(range[0].price).toString(),
                h: high.toString(),
                l: low.toString(),
                c: Number(range[range.length - 1].price).toString()
            });
        });

        return dataOHLC;
    }

    convertToOHLC(data) {
        data.sort((a, b) => d3.ascending(a.timestamp, b.timestamp));
        var result = [];
        var format = d3.timeFormat("%Y-%m-%d");
        data.forEach(d => d.timestamp = format(new Date(d.timestamp * 1000)));
        var allDates = [...new Set(data.map(d => d.timestamp))];
        allDates.forEach(d => {
            var tempObject = { t: null, o: null, c: null, h: null, l: null, };
            var filteredData = data.filter(e => e.timestamp === d);
            
            tempObject.t = d;
            tempObject.o = filteredData[0].price; 
            tempObject.c = filteredData[filteredData.length - 1].price;
            tempObject.h = d3.max(filteredData, e => e.price);
            tempObject.l = d3.min(filteredData, e => e.price);
            result.push(tempObject);
        });
        return result;
    };

    attached() {
        const symbol = this.currentToken;
        const account = this.se.getUser();

        if (account) {
            this.loadingUserBuyBook = true;
            this.loadingUserSellBook = true;
            this.loadingUserBalances = true;

            this.se.ssc.find('market', 'buyBook', { symbol: symbol, account: account }, 100, 0, [{ index: 'timestamp', descending: true }], false).then(result => {
                this.loadingUserBuyBook = false;

                this.userBuyOrders = result.map(o => {
                    o.type = 'buy';
                    o.total = o.price * o.quantity;
                    o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
                    return o;
                });

                this.se.ssc.find('market', 'sellBook', { symbol: symbol, account: account }, 100, 0, [{ index: 'timestamp', descending: true }], false).then(result => {
                    this.loadingUserSellBook = false;

                    this.userSellOrders = result.map(o => {
                        o.type = 'sell';
                        o.total = o.price * o.quantity;
                        o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
                        return o;
                    });

                    this.userOrders = this.userBuyOrders.concat(this.userSellOrders);
                    this.userOrders.sort((a, b) => b.timestamp - a.timestamp);
                });
            });

            this.se.ssc.find('tokens', 'balances', { account: account, symbol: { '$in': [symbol, 'STEEMP'] } }, 2, 0, '', false).then(result => {
                this.loadingUserBalances = false;

                if (result) {
                    for (const token of result) {
                        if (token.symbol === 'STEEMP') {
                            this.steempBalance = token.balance;
                        }

                        if (token.symbol === symbol) {
                            this.tokenBalance = token.balance;
                        }
                    }
                }

                this.userTokenBalance.push(find(result, (balance) => balance.symbol === symbol));
                this.userTokenBalance.push(find(result, (balance) => balance.symbol === 'STEEMP'));
            });
        }
    }

    deposit() {
        this.dialogService.open({ viewModel: DepositModal }).whenClosed(response => {
            console.log(response);
        });
    }

    withdraw() {
        this.dialogService.open({ viewModel: WithdrawModal }).whenClosed(response => {
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

        this.dialogService.open({ viewModel: MarketOrderModal, model: order }).whenClosed(response => {
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
        if (this.currentExchangeMode === 'buy') {
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

    @computedFrom('bidPrice', 'bidQuantity')
    get totalMarketBalance() {
        const total = parseFloat(this.bidPrice) * parseFloat(this.bidQuantity);
        return !isNaN(total) ? total.toFixed(4) : 0;
    }
}
