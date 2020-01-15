import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class NftTransferModal {
    private token;
    private transaction;

    constructor(private controller: DialogController) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(token) {
        this.token = token;
    }
}
