import { sendMarketOrder } from 'common/market';
import { Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { State } from 'store/state';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from 'environment';
import { EventAggregator } from 'aurelia-event-aggregator';

interface IOrder {
    type: string;
    symbol: string;
    quantity: string;
    price: string;
}

@autoinject()
export class MarketOrderModal {
    private environment = environment;
    private subscription: Subscription;
    private user: any;
    private loading = false;
    private order: IOrder = {
        type: '',
        symbol: '',
        quantity: '',
        price: ''
    };
    private eventAggregator: EventAggregator;
    private reloadEventData: IReloadEventData = {
        reloadBuyBook: false,
        reloadSellBook: false,
        reloadTradeHistory: false,
        reloadUserExchangeData: false
    };

    constructor(private controller: DialogController, private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue, private ea: EventAggregator) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
        this.eventAggregator = ea;
    }

    activate(model) {
        this.order = model;
    }

    bind() {
        this.subscription = this.store.state.pipe(pluck('account')).subscribe((user: any) => {
            this.user = user;
        });
    }

    unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    async confirmOrder() {
        try {
            this.loading = true;
            const order = await sendMarketOrder(this.se.getUser(), this.order.type, this.order.symbol, this.order.quantity, this.order.price);

            if (order) {                
                this.controller.ok();

                this.reloadEventData.reloadUserExchangeData = true;

                if (this.order.type === "buy") {
                    this.reloadEventData.reloadBuyBook = true;
                } else {
                    this.reloadEventData.reloadSellBook = true;
                }

                this.eventAggregator.publish('eventReload', { data: this.reloadEventData });
            }
        } catch (e) {
            this.loading = false;
        }
    }
}
