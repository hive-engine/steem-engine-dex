import { customElement, bindable } from 'aurelia-framework';
import { cancelMarketOrder } from 'common/market';
import { SteemEngine } from 'services/steem-engine';
import { EventAggregator } from 'aurelia-event-aggregator';

@customElement('token-open-orders')
export class TokenOpenOrders {
    @bindable() loading = true;
    @bindable() orders;

    private eventAggregator: EventAggregator;
    private reloadEventData: IReloadEventData = {
        reloadBuyBook: false,
        reloadSellBook: false,
        reloadTradeHistory: false,
        reloadUserExchangeData: false,
        reloadTokenOpenOrders: false
    };

    constructor(private se: SteemEngine, private ea: EventAggregator) {
        this.eventAggregator = ea;
    }

    attached() {
        this.loading = false;
    }

    async cancelOrder(type: string, txId: string, symbol: string) {
        this.loading = true;
        const res: any = await cancelMarketOrder(this.se.getUser(), type, txId, symbol);
                
        if (res && res.transactionId) {
            this.reloadEventData.reloadUserExchangeData = true;
            this.reloadEventData.reloadTokenOpenOrders = true;

            if (type === "buy") {
                this.reloadEventData.reloadBuyBook = true;
            } else {
                this.reloadEventData.reloadSellBook = true;
            }

            this.eventAggregator.publish('eventReload', { data: this.reloadEventData });
        }
        this.loading = false;
    }
}
