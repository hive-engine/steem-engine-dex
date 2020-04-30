import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from "../dswap.module.css";

@autoinject()
@customElement('trade')
export class Trade {
    private styles = styles;
}
