import { SteemEngine } from '../services/steem-engine';
import { autoinject } from 'aurelia-framework';

import styles from './exchange.css'
import { environment } from 'environment';
import moment from 'moment';
import { find, uniq, fill } from 'lodash';

@autoinject()
export class Exchange {
    private environment = environment;
    private currentToken: string;
    private data;
    private styles = styles;
    private tokenData;
    private chartData: any = {};
    private sellBook = [];
    private buyBook = [];
    private tradeHistory = [];
    private userOrders = [];

    constructor(private se: SteemEngine) {

    }

    async activate({symbol}) {
        this.currentToken = symbol;

        await this.se.loadTokens();

        this.tokenData = this.se.tokens.filter(t => t.symbol !== 'STEEMP')
            .filter(t => t.metadata && !t.metadata.hide_in_market);

        this.data = this.tokenData.find(t => t.symbol === symbol);

        let tasks = [];
        let precision = this.data.precision;

        tasks.push(this.se.ssc.find('market', 'buyBook', { symbol: symbol }, 200, 0, [{ index: 'price', descending: true }], false));
		tasks.push(this.se.ssc.find('market', 'sellBook', { symbol: symbol }, 200, 0, [{ index: 'price', descending: false }], false));
        tasks.push(this.se.ssc.find('market', 'tradesHistory', { symbol: symbol }, 30, 0, [{ index: 'timestamp', descending: false }], false));
        
        const account = localStorage.getItem('username');

        if (account) {
			tasks.push(this.se.ssc.find('market', 'buyBook', { symbol: symbol, account: account }, 100, 0, [{ index: 'timestamp', descending: true }], false));
			tasks.push(this.se.ssc.find('market', 'sellBook', { symbol: symbol, account: account }, 100, 0, [{ index: 'timestamp', descending: true }], false));
            tasks.push(this.se.ssc.find('tokens', 'balances', { account: account, symbol : { '$in' : [symbol, 'STEEMP'] } }, 2, 0, '', false));
        }

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

        let user_orders = [];
        let user_token_balance = null;
        let user_steemp_balance = null;

        if (account) {
            // prepare user orders and balance
            let user_buy_orders = results[3].map(o => {
                o.type = 'buy';
                o.total = o.price * o.quantity;
                o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
                return o;
            });

            let user_sell_orders = results[4].map(o => {
                o.type = 'sell';
                o.total = o.price * o.quantity;
                o.timestamp_string = moment.unix(o.timestamp).format('YYYY-M-DD HH:mm:ss');
                return o;
            });

            this.userOrders = user_buy_orders.concat(user_sell_orders);
            this.userOrders.sort((a, b) => b.timestamp - a.timestamp);

            user_token_balance = find(results[5], (balance) => balance.symbol === symbol);
            user_steemp_balance = find(results[5], (balance) => balance.symbol === 'STEEMP');
        }

        
        this.buyBook = this.buyBook.slice(0, 10);
        this.sellBook = this.sellBook.slice(0, 10);
        this.tradeHistory = this.tradeHistory.slice(0, 10);

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
}
