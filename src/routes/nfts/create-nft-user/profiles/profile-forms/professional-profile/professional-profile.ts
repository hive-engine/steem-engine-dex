import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './professional-profile.module.css';

@autoinject()
@customElement('professionalProfile')
export class ProfessionalProfile {
    private styles = styles;
}
