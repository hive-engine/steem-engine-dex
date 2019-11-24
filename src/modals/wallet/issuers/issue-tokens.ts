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
import styles from './issue-tokens.module.css';
import { loadTokensList, loadAccountBalances } from 'store/actions';
import { stateTokensOnlyPegged } from 'common/functions';

@autoinject()
export class IssueTokensModal {
    @bindable amount;
    @bindable username;

    private styles = styles;
    private loading = false;
    private state: State;
    private subscription: Subscription;   
    private token: any;
    private validationController;
    private renderer;
    private tokenBalance;

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

    async activate(symbol) {
        if (!this.state.tokens || this.state.tokens.length == 0 || stateTokensOnlyPegged(this.state.tokens)) {
            await dispatchify(loadTokensList)();
            await dispatchify(loadAccountBalances)();
        }

        this.token = this.state.tokens.find(x => x.symbol === symbol);        
        this.tokenBalance = parseFloat(this.token.maxSupply) - parseFloat(this.token.circulatingSupply);        
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('amount')
                .required()
                    .withMessageKey('errors:amountRequired')
                .then()
                    .satisfies((value: any, object: any) => parseFloat(value) > 0)
                    .withMessageKey('errors:amountGreaterThanZero')
                    .satisfies((value: any, object: IssueTokensModal) => {
                        const amount = parseFloat(value);

                        return (amount <= object.tokenBalance);
                    })
                    .withMessageKey('errors:insufficientBalanceForIssueToken')            
            .ensure('username')
                .required()
                    .withMessageKey('errors:usernameRequired')
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
                    username: this.username,
                    balance: this.tokenBalance,
                    symbol: this.token.symbol,
                    ns: 'errors'
                });

                this.toast.error(toast);
            }
        }

        if (validationResult.valid) {                       

            const result = await this.se.issueToken(this.token.symbol, this.username, this.amount);

            if (result) {
                this.controller.ok();
            }
        }

        this.loading = false;
    }
}
