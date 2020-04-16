import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './edit-profile.module.css';

@autoinject()
@customElement('editprofile')
export class CoreProfile {
    private styles = styles;
}
