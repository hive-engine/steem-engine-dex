import { customElement, bindable, bindingMode } from 'aurelia-framework';

import countries from '../common/data/countries.json';

@customElement('countries')
export class Countries {
    @bindable({ defaultBindingMode: bindingMode.twoWay }) value;

    private countries = countries;
}
