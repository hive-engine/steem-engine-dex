import styles from './crowdfunding-explore.module.css';
import { customElement, bindable } from 'aurelia-framework';
import { faClock } from '@fortawesome/pro-solid-svg-icons';


export class crowdfundingExplore {
           @bindable iconClock = faClock;

           private styles = styles;
       }
