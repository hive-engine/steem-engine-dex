import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './core-profile.module.css';

@autoinject()
@customElement('coreProfile')
export class CoreProfile {
    private styles = styles;
}
