import { createTransaction } from 'common/functions';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { INft } from './../../store/state';
import { Redirect } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { NewInstance, TaskQueue } from 'aurelia-framework';

import cloneDeep from 'lodash/cloneDeep';

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
    private nft: INft;

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

        if (validationResult.valid && this.nft.name !== this.token.name) {
            const payload = {
                symbol: this.nft.symbol,
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

        const payload = { symbol: this.nft.symbol, metadata: {} } as Partial<INft>;

        if (this.nft.metadata.url !== this.token.metadata.url) {
            payload.metadata.url = this.token.metadata.url;
        }

        if (this.nft.metadata.icon !== this.token.metadata.icon) {
            payload.metadata.icon = this.token.metadata.icon;
        }

        if (this.nft.metadata.desc !== this.token.metadata.desc) {
            payload.metadata.desc = this.token.metadata.desc;
        }

        // Nothing to update, so do nothing
        if (!Object.keys(payload.metadata).length) {
            return;
        }

        // Payload can be a maximum of 1000 characters
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
        }
    }

    stateChanged(newState) {
        this.token = cloneDeep(newState.nft);

        if (this.token.metadata.url === null) {
            this.token.metadata.url = '';
        }

        if (this.token.metadata.desc === null) {
            this.token.metadata.desc = '';
        }

        if (this.token.metadata.icon === null) {
            this.token.metadata.icon = '';
        }

        this.nft = cloneDeep(this.token);

        this.addValidationRules();
    }

}
