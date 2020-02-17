import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './add-personal-details.module.css';

@autoinject()
@customElement('personaldetails')
export class PersonalDetails {
    private styles = styles;
}
