import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from "../dswap.module.css";

@autoinject()
@customElement('swapnav')
export class SwapNav {
    private styles = styles;
}
