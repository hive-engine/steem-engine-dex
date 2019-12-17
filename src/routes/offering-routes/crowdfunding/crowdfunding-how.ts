import styles from './crowdfunding-how.module.css';
import { customElement, bindable } from 'aurelia-framework';
import { faClock } from '@fortawesome/pro-solid-svg-icons';

export class crowdfundingHow {
    private styles = styles;
    @bindable iconClock = faClock;
}
