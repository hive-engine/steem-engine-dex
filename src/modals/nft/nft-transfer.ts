import { checkTransaction } from 'common/steem-engine';
import { sleep } from 'common/functions';
import { loading } from 'store/actions';
import { dispatchify } from 'aurelia-store';
import { NftService } from 'services/nft-service';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { ToastService, ToastMessage } from 'services/toast-service';
import { ValidationControllerFactory, ControllerValidateResult, ValidationRules } from 'aurelia-validation';
import { I18N } from 'aurelia-i18n';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';

@autoinject()
export class NftTransferModal {
    private token;
    private transactionTo;
    private transactionToType;
    private errors: string[] = [];
    private loading = false;
    private validationController;
    private renderer;

    constructor(private controller: DialogController, private nftService: NftService, private toast: ToastService, private controllerFactory: ValidationControllerFactory, private i18n: I18N) {
        this.validationController = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);

        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(token) {
        this.token = token;
        this.transactionToType = "user";
        console.log(token);
    }

    bind() {
        this.createValidationRules();
    }

    private createValidationRules() {
        const rules = ValidationRules            
            .ensure('transactionTo')
            .required()
            .withMessageKey('errors:nftTransferToRequired')
            .ensure('transactionToType')
            .required()
            .withMessageKey('errors:nftTransferToTypeRequired')
            .rules;

        this.validationController.addObject(this, rules);
    }

    async transfer() {
        this.loading = true;

        try {
            const validationResult: ControllerValidateResult = await this.validationController.validate();

            this.loading = true;

            for (const result of validationResult.results) {
                if (!result.valid) {
                    const toast = new ToastMessage();

                    toast.message = this.i18n.tr(result.rule.messageKey, {
                        to: this.transactionTo,
                        toType: this.transactionToType,
                        symbol: this.token.symbol,
                        ns: 'errors'
                    });

                    this.toast.error(toast);
                }
            }

            if (validationResult.valid) {
                const transfer = await this.nftService.transfer(this.token.symbol, this.token._id, this.transactionTo, this.transactionToType) as any;

                if (transfer.success) {
                    try {
                        const verify = await checkTransaction(transfer.result.id, 3);

                        if (verify?.errors) {
                            this.errors = verify.errors;
                        } else {
                            await sleep(3200);

                            window.location.reload();
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            this.loading = false;
        } catch {
            this.loading = false;
        }
    }
}
