import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './user-feed.module.css';

@autoinject()
@customElement('userfeed')
export class UserFeed {
    private styles = styles;
    
}
