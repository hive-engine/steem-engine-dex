import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../edit-profile.module.css';

@autoinject()
@customElement('programminglanguages')
export class ProgrammingLanguages {
    private styles = styles;
    // private n;
    @bindable clicked;

    handleClick(n) {
        console.log('Hello from Home Address')
    }
}
