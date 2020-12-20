import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../dswap.module.css';

@autoinject()
@customElement('transactions')
export class Transactions {
    private styles = styles;
}
