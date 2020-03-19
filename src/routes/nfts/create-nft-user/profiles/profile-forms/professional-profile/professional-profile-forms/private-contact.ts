import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../professional-profile.module.css';

@autoinject()
@customElement('privatecontact')
export class PrivateContact {
    private styles = styles;
    @bindable clicked;

    handleClick(n) {
        console.log('Hello from Home Address')
    }
}
