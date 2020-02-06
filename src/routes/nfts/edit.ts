import { createTransaction } from 'common/functions';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { Redirect } from 'aurelia-router';
import { DialogService } from 'aurelia-dialog';
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
    private nameRules;
    private orgNameRules;
    private productNameRules;
    private orgName;
    private productName;
    private name;
    private loading = false;

    static inject = [NewInstance.of(ValidationController), NewInstance.of(ValidationController), NewInstance.of(ValidationController), NewInstance.of(ValidationController), SteemEngine, TaskQueue, DialogService];

    constructor(private nameController: ValidationController,
        private metadataController: ValidationController,
        private orgNameController: ValidationController,
        private productNameController: ValidationController,
        private se: SteemEngine,
        private taskQueue: TaskQueue,
        private dialogService: DialogService) {

        this.renderer = new BootstrapFormRenderer();

        this.nameController.addRenderer(this.renderer);
        this.metadataController.addRenderer(this.renderer);
        this.orgNameController.addRenderer(this.renderer);
        this.productNameController.addRenderer(this.renderer);
    }

    async canActivate({ symbol }) {
        try {
            await dispatchify(getNft)(symbol);            
        } catch {
            return new Redirect('/wallet');
        }
    }    

    async updateName() {
        const validationResult = await this.nameController.validate();

        if (validationResult.valid && this.nft.name !== this.name) {
            this.loading = true;

            const payload = {
                symbol: this.nft.symbol,
                name: this.name
            };

            const result = await createTransaction(
                this.state.account.name,
                'nft',
                'updateName',
                payload,
                'Update Name ',
                'updateNftSuccess',
                'updateNftError',
            );

            this.loading = false;

            if (result !== false) {
                window.location.reload();
            }
        }
    }

    async updateOrgName() {
        const validationResult = await this.orgNameController.validate();

        if (validationResult.valid && this.nft.orgName !== this.orgName) {
            this.loading = true;

            const payload = {
                symbol: this.nft.symbol,
                orgName: this.orgName
            };

            const result = await createTransaction(
                this.state.account.name,
                'nft',
                'updateOrgName',
                payload,
                'Update Organization Name',
                'updateNftSuccess',
                'updateNftError',
            );

            this.loading = false;

            if (result !== false) {
                window.location.reload();
            }            
        }
    }

    async updateProductName() {
        const validationResult = await this.productNameController.validate();

        if (validationResult.valid && this.nft.productName !== this.productName) {
            this.loading = true;

            const payload = {
                symbol: this.nft.symbol,
                productName: this.productName
            };

            const result = await createTransaction(
                this.state.account.name,
                'nft',
                'updateProductName',
                payload,
                'Update Product Name',
                'updateNftSuccess',
                'updateNftError',
            );

            this.loading = false;

            if (result !== false) {
                window.location.reload();
            }
        }
    }

    async updateMetadata() {
        const validationResult = await this.metadataController.validate();

        const payload = { symbol: this.nft.symbol, metadata: {
            url: this.token.metadata.url,
            icon: this.token.metadata.icon,
            desc: this.token.metadata.desc
        } } as Partial<INft>;

        // Payload can be a maximum of 1000 characters
        if (JSON.stringify(payload).length > 1000) {
            window.alert('Your payload size was greater than 1000 characters. Please reduce the size of your description, URL or ICON location.')
            return;
        }

        // at least one var must be changed
        if (validationResult.valid &&
            (this.token.metadata.url != this.nft.metadata.url ||
            this.token.metadata.icon != this.nft.metadata.icon ||
            this.token.metadata.desc != this.nft.metadata.desc)) {
            this.loading = true;

            const result = await createTransaction(
                this.state.account.name,
                'nft',
                'updateMetadata',
                payload,
                'Update Metadata ',
                'updateNftSuccess',
                'updateNftError',
            );

            this.loading = false;

            if (result !== false) {
                window.location.reload();
            }            
        }
    }

    bind() {
        this.addValidationRules();
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

        this.name = this.nft.name;
        this.productName = this.nft.productName;
        this.orgName = this.nft.orgName;
    }

    addValidationRules() {
        this.addValidationRulesName();
        this.addValidationRulesOrgName();
        this.addValidationRulesProductName();
    }

    addValidationRulesName() {
        this.nameRules = ValidationRules.
            ensure('name')
            .required()
            .withMessageKey('errors:required')
            .maxLength(50)
            .withMessageKey('errors:maximumLength50')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
            .withMessageKey('errors:requiredAlphaNumericSpaces').rules;

        this.nameController.addObject(this, this.nameRules);
    }

    addValidationRulesOrgName() {
        this.orgNameRules = ValidationRules.
            ensure('orgName')
            .required()
            .withMessageKey('errors:required')
            .maxLength(50)
            .withMessageKey('errors:maximumLength50')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
            .withMessageKey('errors:requiredAlphaNumericSpaces').rules;

        this.orgNameController.addObject(this, this.orgNameRules);
    }

    addValidationRulesProductName() {
        this.productNameRules = ValidationRules.
            ensure('productName')
            .required()
            .withMessageKey('errors:required')
            .maxLength(50)
            .withMessageKey('errors:maximumLength50')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
            .withMessageKey('errors:requiredAlphaNumericSpaces').rules;  

        this.productNameController.addObject(this, this.productNameRules);
    }

}
