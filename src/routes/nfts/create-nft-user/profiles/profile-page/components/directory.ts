import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './directory.module.css';

@autoinject()
@customElement('directory')
export class Directory {
    private styles = styles;
    
}
