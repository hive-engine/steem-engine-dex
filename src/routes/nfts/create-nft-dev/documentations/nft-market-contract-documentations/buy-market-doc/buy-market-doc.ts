import { autoinject } from 'aurelia-framework';

import styles from './buy-market-nft-doc.module.css';

@autoinject()
export class BuyMarketNftDoc {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
