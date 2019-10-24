import { customElement, bindable } from 'aurelia-framework';

@customElement('balances')
export class Balances {    
    @bindable deposit;
    @bindable data;
    @bindable steempBalance;
    @bindable tokenBalance;
}
