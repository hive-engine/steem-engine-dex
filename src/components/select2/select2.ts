import { customElement, containerless, bindable, DOM } from 'aurelia-framework';

import 'select2/dist/css/select2.css';
import 'select2/dist/js/select2';
import './select2.css';

@customElement('select2')
export class Select2 {
    static inject = [Element];

    private element;

    @bindable placeholder = null;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    attached() {
        $(this.element.querySelector('select')).select2({
            placeholder: this.placeholder
        });

        $(this.element.querySelector('select')).on('select2:select select2:unselect', event => {
            const e = DOM.createCustomEvent('change', {
                bubbles: true,
                cancelable: true
            });

            this.element.querySelector('select').dispatchEvent(e);
        });
    }
}
