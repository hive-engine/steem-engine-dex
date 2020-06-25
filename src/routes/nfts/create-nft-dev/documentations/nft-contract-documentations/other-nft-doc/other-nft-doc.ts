import { autoinject } from 'aurelia-framework';

import styles from './delegate-nft-doc.module.css';

@autoinject()
export class DelegateNftDoc {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
