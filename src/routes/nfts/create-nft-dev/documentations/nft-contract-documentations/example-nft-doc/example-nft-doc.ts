import { autoinject } from 'aurelia-framework';

import styles from './example-nft-doc.module.css';

@autoinject()
export class ExampleNftDoc {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
