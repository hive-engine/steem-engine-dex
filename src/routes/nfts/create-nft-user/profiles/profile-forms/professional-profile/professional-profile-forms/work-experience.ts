import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../professional-profile.module.css';

@autoinject()
@customElement('workexperience')
export class WorkExperience {
    private styles = styles;
    @bindable clicked;

    handleClick(n) {
        console.log('Hello from Home Address')
    }
}
