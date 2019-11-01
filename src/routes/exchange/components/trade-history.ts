import { customElement, bindable } from 'aurelia-framework';

@customElement('trade-history')
export class TradeHistory {
    @bindable() loading = true;
    @bindable() trades;
    @bindable() data;

    dataChanged() {
        this.loading = false;
    }
}
