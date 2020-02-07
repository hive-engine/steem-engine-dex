import { MarketService } from 'services/market-service';
import { checkTransaction } from 'common/steem-engine';
import { sleep } from 'common/functions';
import { loading } from 'store/actions';
import { dispatchify } from 'aurelia-store';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationRules, ControllerValidateResult } from 'aurelia-validation';
import { I18N } from 'aurelia-i18n';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { ToastMessage, ToastService } from 'services/toast-service';

@autoinject()
export class NftSellModal {
    private symbol;
    private nftId;
    private price;
    private priceSymbol;
    private user;
    private errors: string[] = [];
    private validationController;
    private renderer;
    private loading = false;

    constructor(private controller: DialogController, private marketService: MarketService, private controllerFactory: ValidationControllerFactory, private i18n: I18N, private toast: ToastService) {
        this.validationController = controllerFactory.createForCurrentScope();
        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);

        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(token) {
        this.symbol = token.symbol;
        this.nftId = token._id;
    }

    bind() {
        this.createValidationRules();
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('price')
            .required()
            .withMessageKey('errors:nftSellPriceRequired')
            .then()
            .satisfies((value: any, object: any) => parseFloat(value) > 0)
            .withMessageKey('errors:nftSellPriceGreaterThanZero')
            .ensure('priceSymbol')
            .required()
            .withMessageKey('errors:nftSellPriceSymbolRequired')
            .rules;

        this.validationController.addObject(this, rules);
    }

    async placeSellOrder() {
        const validationResult: ControllerValidateResult = await this.validationController.validate();

        this.loading = true;

        try {

            for (const result of validationResult.results) {
                if (!result.valid) {
                    const toast = new ToastMessage();

                    toast.message = this.i18n.tr(result.rule.messageKey, {
                        price: this.price,
                        priceSymbol: this.priceSymbol,
                        ns: 'errors'
                    });

                    this.toast.error(toast);
                }
            }

            if (validationResult.valid) {

                const response = await this.marketService.sell(this.symbol, this.nftId, this.price, this.priceSymbol) as any;

                if (response.success) {
                    try {
                        const verify = await checkTransaction(response.result.id, 3);

                        if (verify?.errors) {
                            this.errors = verify.errors;
                        } else {
                            await sleep(3200);

                            this.controller.ok();
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
