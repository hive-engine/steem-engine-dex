import { autoinject } from 'aurelia-framework';

import styles from './basic-tutorial.module.css';

@autoinject()
export class TokenIssuancetDoc {
    private styles = styles;

    handleScroll(e) {
        document.getElementById(e).scrollIntoView();
    }
}
