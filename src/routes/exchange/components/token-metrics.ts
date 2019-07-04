import { customElement, bindable } from 'aurelia-framework';

import styles from './token-metrics.module.css';

@customElement('token-metrics')
export class TokenMetrics {
    private styles = styles;
    
    @bindable token;
}
