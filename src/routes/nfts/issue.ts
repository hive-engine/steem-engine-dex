import { DialogService } from 'aurelia-dialog';
import { SteemEngine } from './../../services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { State } from './../../store/state';
import { connectTo } from 'aurelia-store';

import styles from './issue.module.css';

@autoinject()
@connectTo()
export class Issue {
    private styles = styles;
    private state: State;
    private symbol: string;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate({ symbol }) {
        if (symbol) {
            this.symbol = symbol;
        }
    }
}
