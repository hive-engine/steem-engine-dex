import { Router } from 'aurelia-router';
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-undef */
import { query } from 'common/apollo';
import { BootstrapFormRenderer } from './../resources/bootstrap-form-renderer';
import { loadAccountBalances } from 'store/actions';
import { Store, dispatchify } from 'aurelia-store';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { autoinject } from 'aurelia-framework';
import { createTransaction } from 'common/functions';

import { environment } from 'environment';

@autoinject()
export class CreateToken {
    private renderer: BootstrapFormRenderer;
    private controller: ValidationController;
    private engBalance;
    private tokenCreationFee;

    private tokenName = null;
    private precision = null;
    private symbol = null;
    private maxSupply = null;
    private url = null;

    private state: State;

    constructor(private controllerFactory: ValidationControllerFactory, private router: Router, private store: Store<State>) {
        this.controller = controllerFactory.createForCurrentScope();

        //this.controller.validateTrigger = validateTrigger.manual;

        this.renderer = new BootstrapFormRenderer();
        this.controller.addRenderer(this.renderer);
    }

    async activate() {
        await dispatchify(loadAccountBalances)();

        const data = await query(`query { tokenParams { tokenCreationFee } }`);
        const tokenCreationFee = data?.data?.tokenParams?.[0]?.tokenCreationFee ?? 100;

        this.tokenCreationFee = parseInt(tokenCreationFee);
    }

    bind() {
        this.store.state.subscribe(state => {
            this.state = state;

            // eslint-disable-next-line no-undef
            if (state?.account?.balances?.length) {
                const engToken = state.account.balances.find(token => token.symbol === environment.nativeToken);

                if (engToken) {
                    this.engBalance = engToken.balance;
                }
            }
        });

        ValidationRules.ensure('tokenName')
            .required()
            .withMessageKey('errors:required')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
            .withMessageKey('errors:requiredAlphaNumericSpaces')

            .ensure('precision')
            .required()
            .withMessageKey('errors:required')
            .satisfies((value: string) => parseInt(value) >= 0 && parseInt(value) <= 8)
            .withMessageKey('errors:betweenZeroAndEight')

            .ensure('symbol')
            .required()
            .withMessageKey('errors:required')
            .satisfies((value: string) => {
                const isUppercase = value === value?.toUpperCase() ?? false;
                const validLength = (value?.length >= 3 && value?.length <= 10) ?? false;
                const validString = value?.match(/^[a-zA-Z]*$/)?.length > 0 ?? false;

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

        const payload: { symbol: string; name: string; precision: number; maxSupply: number; url?: string } = {
            symbol: this.symbol,
            name: this.tokenName,
            precision: parseInt(this.precision),
            maxSupply: this.maxSupply,
        };

        if (this.url !== null && this.url.trim() !== '') {
            payload.url = this.url;
        }

        const userHasFunds = this.tokenCreationFee <= this.engBalance;

        if (validationResult.valid && userHasFunds) {
            const result = await createTransaction(
                this.state.account.name,
                'tokens',
                'create',
                payload,
                'Steem Engine Token Registration',
                'tokenCreateSuccess',
                'tokenCreateError',
            );

            if (result !== false) {
                this.router.navigateToRoute('exchange', { symbol: this.symbol })
            }
        }
    }
}
