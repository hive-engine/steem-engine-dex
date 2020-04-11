import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './edit-profile.module.css';

@autoinject()
@customElement('editProfile')
export class CoreProfile {
    private styles = styles;
}
