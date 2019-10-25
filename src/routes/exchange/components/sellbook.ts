import { customElement, bindable, bindingMode } from 'aurelia-framework';

@customElement('sellbook')
export class SellBook {
    @bindable data;
    @bindable loading;
    @bindable sellBook;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) price;    
       
    setBidPrice(newValue) {
        this.price = newValue;
    }
}
