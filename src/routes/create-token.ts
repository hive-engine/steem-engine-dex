import { BootstrapFormRenderer } from './../resources/bootstrap-form-renderer';
import { loadAccountBalances } from 'store/actions';
import { State } from './../store/state';
import { Store, dispatchify } from 'aurelia-store';
import { ValidationController, ValidationControllerFactory, validateTrigger, ValidationRules } from 'aurelia-validation';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class CreateToken {
    private renderer: BootstrapFormRenderer;
    private controller: ValidationController;
    private engBalance;

    private tokenName;
    private precision;
    private symbol;
    private maxSupply;

    constructor(private controllerFactory: ValidationControllerFactory, private store: Store<State>) {
        this.controller = controllerFactory.createForCurrentScope();

        this.controller.validateTrigger = validateTrigger.manual;

        this.renderer = new BootstrapFormRenderer();
        this.controller.addRenderer(this.renderer);
    }

    async activate() {
        await dispatchify(loadAccountBalances)();
    }
    
    bind() {
        this.store.state.subscribe(state => {
            // eslint-disable-next-line no-undef
            if (state?.account?.balances?.length) {
                const engToken = state.account.balances.find(token => token.symbol === 'ENG');

                if (engToken) {
                    this.engBalance = engToken.balance;
                }
            }
        });

        ValidationRules
            .ensure('tokenName')
                .required()
                .withMessageKey('errors:requiredAlphaNumericSpaces')
            .ensure('precision')
                .required()
                .between(0, 8)
                .withMessageKey('errors:betweenZeroAndEight')
            .ensure('symbol')
                .required()
                .minLength(1)
                .maxLength(10)
                .withMessageKey('errors:required')
            .ensure('maxSupply')
                .required()
                .between(1, 9007199254740991)
                .withMessageKey('errors:maxSupply')
        .on(CreateToken);
    }

    public async createToken() {
        const validationResult = await this.controller.validate();

        console.log(validationResult);
    }
}
