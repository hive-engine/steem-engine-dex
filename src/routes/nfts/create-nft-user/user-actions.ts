import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './user-actions.module.css';

@autoinject()
@customElement('useractions')
export class UserActions {
    private styles = styles;
    
}
