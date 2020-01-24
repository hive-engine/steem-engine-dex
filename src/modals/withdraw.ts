import { getFormattedCoinPairs } from 'common/steem-engine';
import { Store } from 'aurelia-store';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { ValidationControllerFactory, ControllerValidateResult, ValidationRules } from 'aurelia-validation';
import { ToastService, ToastMessage } from 'services/toast-service';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { I18N } from 'aurelia-i18n';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { environment } from 'environment';
import { toFixedNoRounding } from 'common/functions';

@autoinject()
export class WithdrawModal {
    private environment = environment;
    private subscription: Subscription;
    private user: any;
    private token: any = null;
    private depositInfo: any = null;
    private address = '';
    private loading = false;
    private tokenBalance: any = 0;
    private tokenList = [];
    private validationController;
    private renderer;

    private amount = '0.000';

    constructor(private controller: DialogController, private se: SteemEngine, private store: Store<State>, private taskQueue: TaskQueue, private controllerFactory: ValidationControllerFactory, private i18n: I18N, private toast: ToastService) {       
        this.validationController = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);

        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    async activate() {
        const pairs = await getFormattedCoinPairs();     
        
        this.tokenList = pairs;
        this.address = this.se.user.name;
    }

    bind() {
        this.subscription = this.store.state.pipe(pluck('account')).subscribe((user: any) => {
            this.user = user;
        });

        this.createValidationRules();        
    }

    unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    tokenSelected() {
        this.taskQueue.queueMicroTask(async () => {
            this.tokenBalance = 0;
            
            if (this.token) {
                this.loading = true;
                const token = this.token.pegged_token_symbol;

                this.amount = '0.000';
                if (token !== 'STEEMP') {                    
                    this.address = "";
                } else {
                    this.address = this.se.user.name;
                }

                try {
                    const balanceResult = await this.se.getBalance(token);
                    if (balanceResult) {
                        this.tokenBalance = balanceResult;
                    }
                } finally {
                    this.loading = false;
                }
            }
        });
    }

    async depositSteem() {
        this.loading = true;

        try {
            const result = await this.se.depositSteem(parseFloat(this.amount).toFixed(3));

            if (result) {
                this.loading = false;
                this.controller.ok();
            } else {
                this.loading = false;
            }
        } finally {
            this.loading = false;
        }
    }

    balanceClicked() {
        this.amount = this.tokenBalance;
    }

    getDepositInfo() {
        const result = this.se.getWithdrawalAddress(this.token.pegged_token_symbol, this.address);
        
        if (result) {
            this.depositInfo = result;
        }
    }

    async handleWithdraw() {
        const validationResult: ControllerValidateResult = await this.validationController.validate();

        this.loading = true;

        for (const result of validationResult.results) {
            if (!result.valid) {
                const toast = new ToastMessage();

                toast.message = this.i18n.tr(result.rule.messageKey, {
                    balance: this.tokenBalance,
                    symbol: this.token ? this.token.pegged_token_symbol : '',
                    ns: 'errors'
                });

                this.toast.error(toast);
            }
        }

        if (validationResult.valid) {            
            let result;
            const amountFixed = toFixedNoRounding(parseFloat(this.amount), 3);

            if (this.token.symbol === 'STEEM') {
                result = await this.se.withdrawSteem(amountFixed);
            } else {
                this.getDepositInfo();

                if (this.depositInfo) {
                    result = this.se.sendToken(this.token.pegged_token_symbol, this.depositInfo.account, amountFixed, this.depositInfo.memo);
                }
            }

            if (result) {
                this.controller.ok();
            }
        }

        this.loading = false;
    }

    private createValidationRules() {
        const rules = ValidationRules
            .ensure('token')
            .required()
            .withMessageKey('errors:withdrawTokenRequired')
            .ensure('amount')
            .required()
            .withMessageKey('errors:amountRequired')
            .then()
            .satisfies((value: any, object: any) => parseFloat(value) > 0)
            .withMessageKey('errors:amountGreaterThanZero')
            .satisfies((value: any, object: WithdrawModal) => {
                const amount = parseFloat(value);

                return (amount <= object.tokenBalance);
            })
            .withMessageKey('errors:insufficientBalanceToWithdraw')
            .ensure('address')
            .required()
            .withMessageKey('errors:withdrawAddressRequired')
            .rules;

        this.validationController.addObject(this, rules);
    }
}
