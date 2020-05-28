import { autoinject } from 'aurelia-framework';

import styles from './nft-contract-documentations.module.css';

@autoinject()
export class CreateNft {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
