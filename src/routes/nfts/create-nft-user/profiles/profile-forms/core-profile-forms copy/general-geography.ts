import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../core-profile.module.css';

@autoinject()
@customElement('generalgeography')
export class GeneralGeography {
    private styles = styles;
    // private n;
    @bindable clicked;

    handleClick(n) {
        console.log('Hello from Home Address')
    }
}
