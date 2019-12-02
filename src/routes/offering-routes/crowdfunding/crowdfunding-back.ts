import styles from './crowdfunding-back.module.css';
import { customElement, bindable } from 'aurelia-framework';
import { faClock } from '@fortawesome/pro-solid-svg-icons';

export class crowdfundingCreate {
    private styles = styles;
    @bindable iconClock = faClock;
}
