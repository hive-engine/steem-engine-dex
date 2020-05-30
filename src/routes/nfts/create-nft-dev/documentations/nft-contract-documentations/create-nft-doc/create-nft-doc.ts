import { autoinject } from 'aurelia-framework';

import styles from './create-nft-doc.module.css';

@autoinject()
export class CreateNftDoc {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
