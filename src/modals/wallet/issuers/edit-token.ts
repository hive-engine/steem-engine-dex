import { dispatchify, Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue, bindable } from 'aurelia-framework';
import { environment } from 'environment';
import { Subscription } from 'rxjs';
import { State, AccountInterface } from 'store/state';
import { ValidationControllerFactory, ControllerValidateResult, ValidationRules } from 'aurelia-validation';
import { ToastService, ToastMessage } from 'services/toast-service';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { I18N } from 'aurelia-i18n';
import styles from './edit-token.module.css';

@autoinject()
export class EditTokenModal {
    @bindable precision;
    @bindable website;
    @bindable icon;
    @bindable description;

    private styles = styles;
    private loading = false;
    private state: State;
    private subscription: Subscription;   
    private token: any;
    private symbol: any;
    private validationController;
    private renderer;
    private tokenBalance;
    private maxPrecision = 8;

    constructor(private controller: DialogController, private se: SteemEngine, private toast: ToastService, private taskQueue: TaskQueue, private store: Store<State>, private controllerFactory: ValidationControllerFactory, private i18n: I18N) {
        this.validationController = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);

        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;    
        this.subscription = this.store.state.subscribe((state: State) => {
            if (state) {
                this.state = state;
            }
        });
    }

    bind() {
        this.createValidationRules();
    }

    async activate(token) {      
        console.log(token);
        this.token = token;
        this.symbol = token.symbol;
        this.website = this.token.metadata.url;
        this.icon = this.token.metadata.icon;
        this.description = this.token.metadata.desc;
        this.precision = this.token.precision;        
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('precision')
                .required()
                    .withMessageKey('errors:precisionRequired')
                .then()
                    .satisfies((value: any, object: any) => parseFloat(value) > 0)
            .withMessageKey('errors:precisionGreaterThanZero')
            .satisfies((value: any, object: any) => parseFloat(value) <= this.maxPrecision)
            .withMessageKey('errors:precisionLessThanMax')
            .satisfies((value: any, object: any) => parseFloat(value) >= this.token.precision)
            .withMessageKey('errors:precisionCannotBeLess')
            .rules;

        this.validationController.addObject(this, rules);
    }

    async confirmSend() {
        const validationResult: ControllerValidateResult = await this.validationController.validate();

        this.loading = true;

        for (const result of validationResult.results) {
            if (!result.valid) {
                const toast = new ToastMessage();

                toast.message = this.i18n.tr(result.rule.messageKey, {                    
                    maxPrecision: this.maxPrecision,
                    currentPrecision: this.token.precision,
                    ns: 'errors'
                });

                this.toast.error(toast);
            }
        }

        if (validationResult.valid) {                       
            let metadata = {
                url: this.website,
                icon: this.icon,
                desc: this.description
            }

            let result = await this.se.updateTokenMetadata(this.symbol, metadata);

            if (this.token.precision != this.precision) {
                result = await this.se.updatePrecision(this.symbol, this.precision);
            }

            if (result) {
                this.controller.ok();
            }
        }

        this.loading = false;
    }
}
