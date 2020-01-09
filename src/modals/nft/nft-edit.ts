import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { ValidationControllerFactory, ValidationController, ValidationRules } from 'aurelia-validation';
import { customJson } from 'common/keychain';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';

import styles from './nft-edit.module.css';

import { environment } from 'environment';

@autoinject()
export class NftEditModal {
    private styles = styles;
    private validation: ValidationController;
    private renderer: BootstrapFormRenderer;

    private loading = false;
    private token;

    private url;
    private icon;
    private name;

    private selectedTab = 'name';

    constructor(private controllerFactory: ValidationControllerFactory, private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;

        this.validation = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validation.addRenderer(this.renderer);
    }

    private bind() {
        ValidationRules.ensure('name')
            .maxLength(50)
                .withMessageKey('errors:maximumLength50')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
                .withMessageKey('errors:requiredAlphaNumericSpaces')
            .on(NftEditModal);
    }

    async activate(token) {
        this.token = token;

        this.name = token.name;
    }

    updateName() {
        const payload = {
            contractName: 'nft',
            contractAction: 'updateName',
            contractPayload: {
                symbol: this.token.symbol,
                name: this.name
            }
        };

        if (window.steem_keychain) {
            const response = await customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(payload), `Update Name`);

            if (response.success) {
                this.controller.ok();
            }
    }
}
