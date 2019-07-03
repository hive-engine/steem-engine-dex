import { I18N } from 'aurelia-i18n';
import { log } from './../services/log';
import { ToastMessage, ToastService } from './../services/toast-service';
import { BootstrapFormRenderer } from './../resources/bootstrap-form-renderer';
import { SteemEngine } from '../services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationController, ValidationRules, ControllerValidateResult } from 'aurelia-validation';

import styles from './exchange.module.css'
import { environment } from 'environment';
import moment from 'moment';
import { find, uniq, fill } from 'lodash';

import { DepositModal } from 'modals/deposit';
import { WithdrawModal } from 'modals/withdraw';
import { MarketOrderModal } from 'modals/market-order';

import { DialogService } from 'aurelia-dialog';
import { percentageOf } from 'common/functions';

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

        this.createValidationRules();
    }

    /**
     * Applies validation rules to inputs on the exchange screen
     */
    private createValidationRules() {
        const rules = ValidationRules
            .ensure('bidQuantity')
                .required()
                    .withMessageKey('errors:bidQuantityRequired')
                .then()
                    .satisfies((value: any, object: any) => parseFloat(value) > 0)
                    .withMessageKey('errors:amountGreaterThanZero')
                .when((object: unknown) => this.currentExchangeMode === 'buy')
                    .satisfies((value: any, object: Exchange) => {
                        const quantity = parseFloat(value);
                        const price = parseFloat(object.bidPrice);
                        const total = quantity * price;

                        return (total <= this.steempBalance);
                    })
                    .withMessageKey('errors:insufficientSteemForOrder')
                .when((object: unknown) => this.currentExchangeMode === 'sell')
                    .satisfies((value: any, object: Exchange) => {
                        const quantity = parseFloat(value);

                        return (quantity <= this.tokenBalance);
                    })
                    .withMessageKey('errors:insufficientSteemForOrder')
            .ensure('bidPrice')
                .required()
                    .withMessageKey('errors:bidPriceRequired')
                .then()
                    .satisfies((value: any, object: any) => parseFloat(value) > 0)
                    .withMessageKey('errors:amountGreaterThanZero')
        .rules;

        this.controller.addObject(this, rules);
    }

    async activate({symbol}) {
        this.currentToken = symbol;

        await this.se.loadTokens();
        await this.se.loadBalances();

        this.tokenData = this.se.tokens.filter(t => t.symbol !== 'STEEMP')
            .filter(t => t.metadata && !t.metadata.hide_in_market);

        this.data = this.tokenData.find(t => t.symbol === symbol);

        let tasks = [];

        tasks.push(this.se.ssc.find('market', 'buyBook', { symbol: symbol }, 200, 0, [{ index: 'price', descending: true }], false));
		tasks.push(this.se.ssc.find('market', 'sellBook', { symbol: symbol }, 200, 0, [{ index: 'price', descending: false }], false));
        tasks.push(this.se.ssc.find('market', 'tradesHistory', { symbol: symbol }, 30, 0, [{ index: 'timestamp', descending: false }], false));

        const results = await Promise.all(tasks);

        // prepare buy orders
        let buy_total = 0;
        this.buyBook = results[0].map(o => {
            buy_total += o.quantity * o.price;
            o.total = buy_total;
            o.amountLocked = o.quantity * o.price;
            return o;
        });
        
        // prepare sell orders
        let sell_total = 0;
        this.sellBook = results[1].map(o => {
            sell_total += o.quantity * o.price;
            o.total = sell_total;
            o.amountLocked = o.quantity * o.price;
            return o;
        });
        
        // prepare trade history
        this.tradeHistory = results[2].map(o => {
            o.total = o.price * o.quantity;
            o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
            return o;
        });

        if (this.sellBook.length) {
            this.bestSellPrice = this.sellBook[0];
        }

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
            ]
        };
    }

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

            this.se.ssc.find('tokens', 'balances', { account: account, symbol : { '$in' : [symbol, 'STEEMP'] } }, 2, 0, '', false).then(result => {
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

                console.log(this.userTokenBalance);
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

    async confirmMarketOrder() {
        // Run the form validation
        const validationResult: ControllerValidateResult = await this.controller.validate();
        
        for (const result of validationResult.results) {
            if (!result.valid) {
                const toast = new ToastMessage();

                toast.message = this.i18n.tr(result.rule.messageKey, {
                    balance: this.steempBalance,
                    tokenBalance: this.tokenBalance,
                    total: parseFloat(this.bidQuantity) * parseFloat(this.bidPrice), 
                    ns: 'errors' 
                });
                
                this.toast.error(toast);
            }
        }

        console.log('Validation result: ', validationResult);

        // All fields are valid
        if (validationResult.valid) {
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
    }

    /**
     * Method for calculating how much a user can buy/sell
     * given their current STEEMP or TOKEN balance
     * @param amount
     */
    amountSelect(amount: string) {
        const actualAmount = parseInt(amount);
        const userSteem = this.steempBalance;
        const userTokenBalance = this.userTokenBalance;
        const buyBook = this.buyBook;
        const sellBook = this.sellBook;

        // Determine what the user can buy from the buy book
        if (this.currentExchangeMode === 'buy') {
            let lastPrice = 0;
            const amount = percentageOf(actualAmount, userSteem);

            if (sellBook) {
                for (const order of sellBook) {
                    // Total is total STEEMP, price is price per 1 quantity and quantity is amount
                    // Total = quantity * price
                    const { total, price, quantity } = order;

                    // ORder total STEEM is greater than user balance
                    if (total > amount) {
                        this.bidPrice = price;
                        break;
                    }
                }
            }
        } 
        // Determine what the user can set the price at to sell all of their token
        else {

        }
    }
}
