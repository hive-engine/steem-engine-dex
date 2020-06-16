import { getUserOpenOrders, cancelMarketOrder } from 'common/market';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { ToastMessage, ToastService } from 'services/toast-service';
import { I18N } from 'aurelia-i18n';

@autoinject()
export class OpenOrders {
    private loadingOpenOrders = false;
    private orders = [];
    private anyOrderChecked = false;

    private openOrdersTable: HTMLTableElement;
    
    constructor(private se: SteemEngine, private i18n: I18N, private toastService: ToastService) {

    }

    attached() {
        this.loadTable();
    }

    loadTable() {
        // @ts-ignore
        $(this.openOrdersTable).DataTable({
            "columnDefs": [
                { "targets": 0, "responsivePriority": 1 }, // Symbol
                { "targets": 1, "responsivePriority": 2 }, // Price (steem)
                { "targets": 2, "responsivePriority": 3 }, // Quantity
                { "targets": 3, "responsivePriority": 10000 }, // Total (steem)
                { "targets": 4, "responsivePriority": 10010 }, // Date
                { "targets": 5, "responsivePriority": 4 }, // Actions
            ],
            bInfo: false,
            paging: false,
            searching: false,
            responsive: true
        });
    }

    async canActivate() {
        this.loadingOpenOrders = true;

        try {            
            this.orders = await getUserOpenOrders(this.se.getUser());
        } catch {
            return false;
        } finally {
            this.loadingOpenOrders = false;
        }
    }

    async cancelOrder(type: string, txId: string, symbol: string) {
        return await cancelMarketOrder(this.se.getUser(), type, txId, symbol);
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
                this.loadingOpenOrders = true;

                for (let o of orders) {
                    let response: any = await this.cancelOrder(o.type, o.txId, o.symbol);
                    
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
            this.orders = await getUserOpenOrders(this.se.getUser());

        this.loadingOpenOrders = false;
    }
}
