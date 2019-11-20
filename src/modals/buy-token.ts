import { dispatchify, Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue, bindable } from 'aurelia-framework';
import { environment } from 'environment';
import { Subscription } from 'rxjs';
import { State, AccountInterface } from 'store/state';
import { ValidationControllerFactory, ControllerValidateResult, ValidationRules } from 'aurelia-validation';
import { ToastService, ToastMessage } from '../services/toast-service';
import { BootstrapFormRenderer } from '../resources/bootstrap-form-renderer';
import { I18N } from 'aurelia-i18n';
import styles from './buy-token.module.css';
import { loadTokensList, loadAccountBalances } from 'store/actions';
import { getAccount } from 'common/steem';

@autoinject()
export class BuyTokenModal {
    @bindable amount;

    private styles = styles;
    private loading = false;
    private state: State;
    private subscription: Subscription;
    private user: any;
    private steemBalance: any;
    private engBalance: any;
    private username: any;
    private validationController;
    private renderer;
    private environment;

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
        this.loading = true;
        if (!this.state.tokens || this.state.tokens.length == 0) {
            await dispatchify(loadTokensList)();
        }

        if (!this.state.account.balances || this.state.account.balances.length == 0) {
            await dispatchify(loadAccountBalances)();
        }

        this.environment = environment;
        this.username = this.state.account.name;

        const user = await getAccount(this.username);
        this.steemBalance = user.balance.replace('STEEM', '').trim();

        this.engBalance = 0;
        const engToken = this.state.account.balances.find(x => x.symbol === environment.nativeToken);
        if (engToken)
            this.engBalance = engToken.balance;

        this.loading = false;
    }

    balanceClicked() {
        this.amount = this.steemBalance;
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('amount')
            .required()
            .withMessageKey('errors:amountRequired')
            .then()
            .satisfies((value: any, object: any) => parseFloat(value) > 0)
            .withMessageKey('errors:amountGreaterThanZero')
            .satisfies((value: any, object: BuyTokenModal) => {
                const amount = parseFloat(value);

                return (amount <= object.steemBalance);
            })
            .withMessageKey('errors:insufficientBalanceForBuyEng')
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
                    balance: this.steemBalance,
                    symbol: environment.peggedToken,
                    ns: 'errors'
                });

                this.toast.error(toast);
            }
        }

        if (validationResult.valid) {

            const result = await this.se.buyENG(this.amount);

            if (result) {
                this.controller.ok();
            }
        }

        this.loading = false;
    }
}
