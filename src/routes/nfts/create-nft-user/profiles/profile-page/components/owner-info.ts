import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './owner-info.module.css';

@autoinject()
@customElement('ownerinfo')
export class OwnerInfo {
    private styles = styles;
    
}
