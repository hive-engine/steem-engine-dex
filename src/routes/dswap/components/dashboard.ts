import { customElement, autoinject, bindable } from 'aurelia-framework';
import { ChartComponent } from '../../../components/chart/chart';
import { loadTokenMarketHistory } from 'common/steem-engine';
import moment from 'moment';

import styles from "../dswap.module.css";

@autoinject()
@customElement('dashboard')
export class Dashboard {
    private styles = styles;
    
    
}
