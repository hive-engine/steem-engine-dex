import { Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { environment } from 'environment';

@autoinject()
export class DepositModal {
    private environment = environment;
    private user: any;
    private token: any = null;
    private depositInfo: any = null;
    private loading = false;
    private tokenList = [];
    
    private amount = '0.000';

    constructor(private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;        
    }

    async activate() {        
        this.tokenList = await this.se.getTokenPairs();
    }

    tokenSelected() {
        this.taskQueue.queueMicroTask(async () => {
            this.loading = false;

            if (this.token !== 'STEEM') {
                this.loading = true;

                try {
                    const result = await this.se.getDepositAddress(this.token);

                    if (result) {
                        this.depositInfo = result;
                    }
                } finally {
                    this.loading = false;
                }
            }
        });
    }

    async depositSteem() {
        this.loading = true;

        try {
            const result = await this.se.depositSteem(parseFloat(this.amount).toFixed(3));

            if (result) {
                this.loading = false;
                this.controller.ok();
            } else {
                this.loading = false;
            }
        } finally {
            this.loading = false;
        }
    }
}
