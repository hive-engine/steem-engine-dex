import { autoinject } from 'aurelia-framework';

import styles from './sell-nft-doc.module.css';

@autoinject()
export class SellMarketNftDoc {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
