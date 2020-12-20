import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './dating-profile.module.css';

@autoinject()
@customElement('datingProfile')
export class DatingProfile {
    private styles = styles;
}
