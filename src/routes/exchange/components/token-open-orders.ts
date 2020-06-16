import { customElement, bindable } from 'aurelia-framework';
import { cancelMarketOrder } from 'common/market';
import { SteemEngine } from 'services/steem-engine';
import { EventAggregator } from 'aurelia-event-aggregator';
import { faInfo } from '@fortawesome/pro-regular-svg-icons';
import { ToastService, ToastMessage } from 'services/toast-service';
import { I18N } from 'aurelia-i18n';

@customElement('token-open-orders')
export class TokenOpenOrders {
    @bindable() loading = true;
    @bindable() orders;
    private anyOrderChecked = false;
    @bindable iconInfo = faInfo;

    private eventAggregator: EventAggregator;
    private reloadEventData: IReloadEventData = {
        reloadBuyBook: false,
        reloadSellBook: false,
        reloadTradeHistory: false,
        reloadUserExchangeData: false,
        reloadTokenOpenOrders: false
    };

    constructor(private se: SteemEngine, private ea: EventAggregator, private i18n: I18N, private toastService: ToastService) {
        this.eventAggregator = ea;
    }

    attached() {
        this.loading = false;
    }

    publishReloadEvent(type) {
        this.reloadEventData.reloadUserExchangeData = true;
        this.reloadEventData.reloadTokenOpenOrders = true;

        if (!type) {
            this.reloadEventData.reloadBuyBook = true;
            this.reloadEventData.reloadSellBook = true;
        } else if (type === "buy") {
            this.reloadEventData.reloadBuyBook = true;
        } else {
            this.reloadEventData.reloadSellBook = true;
        }

        this.eventAggregator.publish('eventReload', { data: this.reloadEventData });
    }

    async cancelOrder(type: string, txId: string, symbol: string) {
        this.loading = true;
        const res: any = await cancelMarketOrder(this.se.getUser(), type, txId, symbol);
                
        if (res && res.transactionId) {
            this.publishReloadEvent(type);
        }
        this.loading = false;
    }

    async isAnyOrderChecked() {
        let ordersChecked = this.orders.find(x => x.checked === true);

        if (ordersChecked)
            this.anyOrderChecked = true;
        else
            this.anyOrderChecked = false;
    }

    async orderCheckChange() {
        this.isAnyOrderChecked();
    }

    async cancelSelectedOrders() {
        let reloadOrders = false;
        let orders = this.orders.filter(x => x.checked === true);

        if (window.steem_keychain) {
            if (orders.length > 0) {
                this.loading = true;

                for (let o of orders) {
                    let response: any = await cancelMarketOrder(this.se.getUser(), o.type, o.txId, o.symbol);

                    if (response && response.transactionId)
                        reloadOrders = true;
                }
            }
        } else {
            var toast = new ToastMessage();

            toast.message = this.i18n.tr('orderCancelSelectedOnlyKeychain', {
                ns: 'notifications'
            });

            this.toastService.error(toast);
        }

        if (reloadOrders)
            this.publishReloadEvent(null);

        this.loading = false;
    }
}
