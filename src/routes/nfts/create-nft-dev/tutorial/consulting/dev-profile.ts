import { autoinject } from 'aurelia-framework';

import styles from './dev-profile.module.css';

@autoinject()
export class DevProfile {
    private styles = styles;
}
