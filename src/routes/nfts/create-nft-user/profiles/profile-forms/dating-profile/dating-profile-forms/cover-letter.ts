import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../dating-profile.module.css';

@autoinject()
@customElement('coverletter')
export class CoverLetter {
    private styles = styles;
    @bindable clicked;

    handleClick(n) {
        console.log('Hello from Home Address')
    }
}
