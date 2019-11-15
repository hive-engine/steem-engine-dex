/* eslint-disable no-undef */
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

    private tokenName = null;
    private precision = null;
    private symbol = null;
    private maxSupply = null;

    constructor(private controllerFactory: ValidationControllerFactory, private store: Store<State>) {
        this.controller = controllerFactory.createForCurrentScope();

        //this.controller.validateTrigger = validateTrigger.manual;

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
                    .withMessageKey('errors:required')
                .satisfies((value: string) => {
                    return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
                })
                    .withMessageKey('errors:requiredAlphaNumericSpaces')

            .ensure('precision')
                .required()
                    .withMessageKey('errors:required')
                .satisfies((value: string) => {
                    return value && parseInt(value) >=0 && parseInt(value) <= 8;
                })
                    .withMessageKey('errors:betweenZeroAndEight')

            .ensure('symbol')
                .required()
                    .withMessageKey('errors:required')
                .satisfies((value: string) => {
                    const isUppercase = (value === value?.toUpperCase()) ?? false;
                    const validLength = (value?.length >= 3 && value?.length <= 10) ?? false;
                    const validString = value?.match(/^[a-zA-Z]*$/)?.length > 0 ?? false

                    return isUppercase && validLength && validString;
                })
                    .withMessageKey('errors:symbolValid')

            .ensure('maxSupply')
            .required()
                .withMessageKey('errors:required')
            .satisfies((value: string) => value && parseInt(value) >= 1 && parseInt(value) <= 9007199254740991)
                .withMessageKey('errors:maxSupply')
        .on(CreateToken);
    }

    public async createToken() {
        const validationResult = await this.controller.validate();

        console.log(validationResult);
    }
}
