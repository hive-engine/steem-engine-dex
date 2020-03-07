import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './professional-profile.module.css';

@autoinject()
@customElement('coreProfile')
export class CoreProfile {
    private styles = styles;
}
