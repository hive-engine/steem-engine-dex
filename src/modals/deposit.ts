import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class DepositModal {
    constructor(private controller: DialogController, private se: SteemEngine) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }
}
