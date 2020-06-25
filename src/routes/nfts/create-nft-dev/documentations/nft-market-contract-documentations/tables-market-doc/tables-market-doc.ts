import { autoinject } from 'aurelia-framework';

import styles from './table-market-doc.module.css';

@autoinject()
export class TableMarketNftDoc {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
