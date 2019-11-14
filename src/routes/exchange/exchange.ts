import { Redirect } from 'aurelia-router';
import { ChartComponent } from './../../components/chart/chart';
import { State } from './../../store/state';

import { I18N } from 'aurelia-i18n';
import { ToastService } from '../../services/toast-service';
import { BootstrapFormRenderer } from '../../resources/bootstrap-form-renderer';
import { SteemEngine } from '../../services/steem-engine';
import { autoinject, computedFrom, observable } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';

import styles from './exchange.module.css';
import { environment } from 'environment';
import moment from 'moment';
import { uniq, fill } from 'lodash';

import { loadTokenMarketHistory } from 'common/steem-engine';

import { DepositModal } from 'modals/deposit';
import { WithdrawModal } from 'modals/withdraw';
import { MarketOrderModal } from 'modals/market-order';

import { DialogService } from 'aurelia-dialog';
import { percentageOf } from 'common/functions';
import { loadBuyBook, loadSellBook, exchangeData } from 'store/actions';
import { dispatchify, Store } from 'aurelia-store';
import { Subscription as StateSubscription } from 'rxjs';
import { getStateOnce } from 'store/store';
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
    @observable({ changeHandler: 'currentTokenChanged' })
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

    private currentExchangeMode = 'buy';
    private bidQuantity = '';
    private bidPrice = '';

    private subscription: StateSubscription;
    private state: State;

    private chartRef: ChartComponent;

    constructor(
        private se: SteemEngine,
        private dialogService: DialogService,
        private i18n: I18N,
        private controllerFactory: ValidationControllerFactory,
        private toast: ToastService,
        private store: Store<State>,
        private ea: EventAggregator,
    ) {
        this.controller = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.controller.addRenderer(this.renderer);
        this.eventAggregator = ea;
    }

    bind() {
        this.subscription = this.store.state.subscribe(async (state: State) => {
            // eslint-disable-next-line no-undef
            if (state?.$action?.name === 'login' || state?.$action?.name === 'logout') {
                this.loadUserExchangeData();
            }

            this.state = state;
        });
    }

    canActivate({ symbol }) {
        if (!symbol) {
            return new Redirect('/exchange/ENG');
        }
    }

    async activate({ symbol }) {
        this.currentToken = symbol;

        // eslint-disable-next-line no-undef
        if (!this?.state?.loggedIn) {
            this.loadUserExchangeData();
        }
    }

    async loadTokenHistoryData(state, buyOrderDisplayData, sellOrderDisplayData) {
        this.tradeHistory = state.tradeHistory;

        const tokenHistory = await loadTokenMarketHistory(this.currentToken);
        const limitCandleStick = 60;

        const candleStickData = tokenHistory.slice(0, limitCandleStick).map(x => {
            return {
                t: moment.unix(x.timestamp).format('YYYY-MM-DD HH:mm:ss'), //x.timestamp * 1000,
                o: x.openPrice,
                h: x.highestPrice,
                l: x.lowestPrice,
                c: x.closePrice,
            };
        });

        this.chartData = {
            labels: buyOrderDisplayData.labels.concat(sellOrderDisplayData.labels),
            datasets: [
                {
                    label: 'Buy',
                    steppedLine: 'after',
                    borderColor: '#88e86b',
                    backgroundColor: '#a9ea96',
                    data: buyOrderDisplayData.dataset,
                },
                {
                    label: 'Sell',
                    steppedLine: 'before',
                    borderColor: '#e45858',
                    backgroundColor: '#e87f7f',
                    data: sellOrderDisplayData.dataset,
                },
            ],
            ohlcData: candleStickData,
        };
    }

    async loadSellOrders(state) {
        this.sellBook = state.sellBook;

        const sellOrderLabels = uniq(this.sellBook.map(o => parseFloat(o.price)));
        const sellOrderDataset = fill(Array(this.orderDataSetLength), null);
        let sellOrderCurrentVolume = 0;

        sellOrderLabels.forEach(label => {
            const matchingSellOrders = this.sellBook.filter(o => parseFloat(o.price) === label);

            if (matchingSellOrders.length === 0) {
                sellOrderDataset.push(null);
            } else {
                sellOrderCurrentVolume =
                    sellOrderCurrentVolume + matchingSellOrders.reduce((acc, val) => acc + parseFloat(val.quantity), 0);
                sellOrderDataset.push(sellOrderCurrentVolume);
            }
        });

        this.sellBook.reverse();

        return { dataset: sellOrderDataset, labels: sellOrderLabels } as IOrderDataDisplay;
    }

    async loadBuyOrders(state) {
        this.buyBook = state.buyBook;

        const buyOrderLabels = uniq(this.buyBook.map(o => parseFloat(o.price)));
        const buyOrderDataset = [];

        let buyOrderCurrentVolume = 0;

        buyOrderLabels.forEach(label => {
            const matchingBuyOrders = this.buyBook.filter(o => parseFloat(o.price) === label);

            if (matchingBuyOrders.length === 0) {
                buyOrderDataset.push(null);
            } else {
                buyOrderCurrentVolume =
                    buyOrderCurrentVolume + matchingBuyOrders.reduce((acc, val) => acc + parseFloat(val.quantity), 0);
                buyOrderDataset.push(buyOrderCurrentVolume);
            }
        });

        buyOrderLabels.reverse();
        buyOrderDataset.reverse();

        this.orderDataSetLength = buyOrderDataset.length;
        return { dataset: buyOrderDataset, labels: buyOrderLabels } as IOrderDataDisplay;
    }

    loadUserExchangeData() {
        dispatchify(exchangeData)(this.currentToken).then(async () => {
            this.tokenData = this.state.tokens
                .filter(t => t.symbol !== 'STEEMP')
                .filter(t => t.metadata && !t.metadata.hide_in_market);

            this.data = this.tokenData.find(t => t.symbol === this.currentToken);

            if (this.state.sellBook.length) {
                this.bestSellPrice = this.state.sellBook[0];
            }

            // eslint-disable-next-line no-undef
            this.steempBalance = this.state.account.balances.find(token => token.symbol === 'STEEMP')?.balance;

            if (this.state.loggedIn) {
                this.tokenBalance = this.state.account.balances.find(token => token.symbol === this.currentToken)?.balance ?? 0;
            }

            const buyOrderDisplayData = await this.loadBuyOrders(this.state);
            const sellOrderDisplayData = await this.loadSellOrders(this.state);

            await this.loadTokenHistoryData(this.state, buyOrderDisplayData, sellOrderDisplayData);

            this.chartRef.attached();
        });
    }

    async attached() {
        this.subscriber = this.eventAggregator.subscribe('eventReload', response => {
            this.catchReloadEvent(response);
        });
    }

    async catchReloadEvent(response) {
        const data = response.data as IReloadEventData;
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
            price: this.bidPrice,
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
