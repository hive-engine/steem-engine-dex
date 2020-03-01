import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../core-profile.module.css';

@autoinject()
@customElement('sidebar')
export class SideBar {
    private styles = styles;
    // private n;
    @bindable clicked;

    handleClick(n) {
        
    }
}
