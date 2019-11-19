import { createTransaction } from 'common/functions';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { INft } from './../../store/state';
import { Redirect } from 'aurelia-router';
import { pluck } from 'rxjs/operators';
import { DialogService } from 'aurelia-dialog';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { NewInstance, TaskQueue } from 'aurelia-framework';


import { connectTo, dispatchify } from 'aurelia-store';
import { getNft } from 'store/actions';

import styles from './edit.module.css';

@connectTo()
export class EditNft {
    private renderer: BootstrapFormRenderer;
    private controller: ValidationController;
    private styles = styles;
    private state: State;
    private token: INft;

    static inject = [NewInstance.of(ValidationController), NewInstance.of(ValidationController), SteemEngine, TaskQueue, DialogService];

    constructor(private nameController: ValidationController, private metadataController: ValidationController, private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {
        this.renderer = new BootstrapFormRenderer();

        this.nameController.addRenderer(this.renderer);
        this.metadataController.addRenderer(this.renderer);
    }

    async canActivate({ symbol }) {
        try {
            await dispatchify(getNft)(symbol);
        } catch {
            return new Redirect('/wallet');
        }
    }

    addValidationRules() {
        const nameRules = ValidationRules.
            ensure('name')
            .required()
            .withMessageKey('errors:required')
            .maxLength(50)
            .withMessageKey('errors:maximumLength50')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
            .withMessageKey('errors:requiredAlphaNumericSpaces').rules;

        this.nameController.removeObject(this.token);
        this.nameController.addObject(this.token, nameRules);
    }

    async updateName() {
        const validationResult = await this.nameController.validate();

        const nft = { ...this.state.nft };

        if (validationResult.valid && nft.name !== this.token.name) {
            const payload = {
                symbol: nft.symbol,
                name: this.token.name
            };

            const result = await createTransaction(
                this.state.account.name,
                'nft',
                'updateName',
                payload,
                'Update Name ',
                'updateSuccess',
                'updateError',
            );

            if (result !== false) {
                window.location.reload();
            }
        }
    }

    async updateMetadata() {
        const validationResult = await this.metadataController.validate();

        const nft = { ...this.state.nft };
        const payload = { symbol: nft.symbol, metadata: {} } as Partial<INft>;

        if (nft.metadata.url !== this.token.metadata.url || nft.metadata.url === null) {
            payload.metadata.url = this.token.metadata.url;
        }

        if (nft.metadata.icon !== this.token.metadata.icon || nft.metadata.icon === null) {
            payload.metadata.icon = this.token.metadata.icon;
        }

        if (nft.metadata.desc !== this.token.metadata.desc || nft.metadata.desc === null) {
            payload.metadata.desc = this.token.metadata.desc;
        }

        if (JSON.stringify(payload).length > 1000) {
            window.alert('Your payload size was greater than 1000 characters. Please reduce the size of your description, URL or ICON location.')
            return;
        }

        if (validationResult.valid) {
            const result = await createTransaction(
                this.state.account.name,
                'nft',
                'updateMetadata',
                payload,
                'Update Metadata ',
                'updateSuccess',
                'updateError',
            );

            if (result !== false) {
                window.location.reload();
            }
        }
    }

    stateChanged(newState) {
        this.token = { ...newState.nft };
        this.addValidationRules();
    }

}
