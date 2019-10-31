import { ToastMessage, ToastService } from './../../../services/toast-service';
import { BootstrapFormRenderer } from './../../../resources/bootstrap-form-renderer';
import { bindable, bindingMode, autoinject } from 'aurelia-framework';
import { ValidationControllerFactory, ValidationRules, ControllerValidateResult } from 'aurelia-validation';
import { I18N } from 'aurelia-i18n';

import styles from './order-actions.module.css';

@autoinject()
export class OrderActions {
    private styles = styles;

    @bindable amountSelect;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) price;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) quantity;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) mode;
    @bindable confirm;
    @bindable data;
    @bindable steempBalance;
    @bindable tokenBalance;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) total;

    private validationController;
    private renderer;

    constructor(private controllerFactory: ValidationControllerFactory, private toast: ToastService, private i18n: I18N) {
        this.validationController = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);
    }

    bind() {
        this.createValidationRules();
    }

    async confirmButtonPressed() {
        const validationResult: ControllerValidateResult = await this.validationController.validate();
        
        for (const result of validationResult.results) {            
            if (!result.valid) {
                const toast = new ToastMessage();

                toast.message = this.i18n.tr(result.rule.messageKey, {
                    balance: this.steempBalance,
                    tokenBalance: this.tokenBalance,
                    total: parseFloat(this.quantity) * parseFloat(this.price), 
                    ns: 'errors' 
                });
                
                this.toast.error(toast);
            }
        }

        if (validationResult.valid) {
            this.confirm();
        }
    }

    async maxBuySell() {
        if (this.mode == "buy") {
            if (this.price > 0) {
                this.quantity = this.steempBalance / this.price;
            }
        } else if (this.mode == "sell") {
            this.quantity = this.tokenBalance;
        }
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('quantity')
                .required()
                    .withMessageKey('errors:bidQuantityRequired')
                .then()
                    .satisfies((value: any, object: any) => parseFloat(value) > 0)
                    .withMessageKey('errors:amountGreaterThanZero')                
                    .satisfies((value: any, object: OrderActions) => {
                        const quantity = parseFloat(value);
                        const price = parseFloat(object.price);
                        const total = quantity * price;                        

                        return (total <= object.steempBalance);
                    }).when((object: OrderActions) => object.mode === 'buy')
                    .withMessageKey('errors:insufficientSteemForOrder')                
                    .satisfies((value: any, object: OrderActions) => {
                        const quantity = parseFloat(value);

                        return (quantity <= object.tokenBalance);
                    }).when((object: OrderActions) => object.mode === 'sell')
                    .withMessageKey('errors:insufficientSteemForOrder')
            .ensure('price')
                .required()
                    .withMessageKey('errors:bidPriceRequired')
                .then()
                    .satisfies((value: any, object: any) => parseFloat(value) > 0)
                    .withMessageKey('errors:amountGreaterThanZero')
        .rules;

        this.validationController.addObject(this, rules);
    }
}
