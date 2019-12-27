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

    private issuingTo: string;
    private tokenProperties: {name: string; value: string;}[] = [];
    private lockedTokens: {name: string; amount: string;}[] = [];

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate({ symbol }) {
        if (symbol) {
            this.symbol = symbol;
        }
    }

    addTokenPropertyRow() {
        this.tokenProperties.push({ name: '', value: '' });
    }

    addLockedTokenPropertyRow() {
        this.lockedTokens.push({ name: '', amount: '' });
    }

    removeProperty($index) {
        this.tokenProperties.splice($index, 1);
    }

    removeLockedToken($index) {
        this.lockedTokens.splice($index, 1);
    }

    issueNft() {

    }
}
