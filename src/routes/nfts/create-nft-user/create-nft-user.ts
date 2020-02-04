import { ssc } from 'common/ssc';
import { SteemEngine } from 'services/steem-engine';
import { Router } from 'aurelia-router';
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-undef */
import { query } from 'common/apollo';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { loadAccountBalances } from 'store/actions';
import { Store, dispatchify } from 'aurelia-store';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { autoinject } from 'aurelia-framework';
import { createTransaction } from 'common/functions';

import { environment } from 'environment';
import styles from './create-nft-user.module.css';
@autoinject()
export class CreateNftUser {
    private renderer: BootstrapFormRenderer;
    private controller: ValidationController;
    private engBalance;
    private tokenCreationFee;

    private tokenName = null;
    private symbol = null;
    private maxSupply = null;
    private url = null;
    private authorisedIssuingAccounts: any[] = [];
    private authorisedIssuingContracts: any[] = [];

    private state: State;
    private environment = environment;
    private styles = styles;

    constructor(
        private controllerFactory: ValidationControllerFactory,
        private se: SteemEngine,
        private router: Router,
        private store: Store<State>,
    ) {
        this.controller = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.controller.addRenderer(this.renderer);
    }
    async activate() {
        await dispatchify(loadAccountBalances)();

        const data = await ssc.find('tokens', 'params', {});
        const tokenCreationFee = data?.tokenParams?.[0]?.tokenCreationFee ?? 100;

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
            .maxLength(50)
            .withMessageKey('errors:maximumLength50')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
            .withMessageKey('errors:requiredAlphaNumericSpaces')

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
            .satisfiesRule('nftAvailable')
            .withMessageKey('errors:nftUnavailable')

            .ensure('maxSupply')
            .satisfies((value: string) => {
                return this.maxSupply !== null && this.maxSupply.toString().length
                    ? parseInt(value) >= 1 && parseInt(value) <= 9007199254740991
                    : true;
            })
            .withMessageKey('errors:maxSupply')

            .ensure('authorisedIssuingAccounts')
            .maxItems(10)
            .withMessageKey('errors:max10rows')

            .ensure('authorisedIssuingContracts')
            .maxItems(10)
            .withMessageKey('errors:max10rows')
            .on(CreateNftUser);
    }

    attached() {
        this.authorisedIssuingAccounts.push({ name: this.se.getUser() });
        this.authorisedIssuingContracts.push({ name: '' });
        
    }

    addAuthorisedAccount() {
        this.authorisedIssuingAccounts.push({ name: '' });
    }

    addAuthorisedContract() {
        this.authorisedIssuingContracts.push({ name: '' });
    }

    public async createToken() {
        const validationResult = await this.controller.validate();

        const payload: {
            symbol: string;
            name: string;
            maxSupply?: number;
            url?: string;
            authorizedIssuingAccounts?: string[];
            authorisedIssuingContracts?: string[];
        } = {
            symbol: this.symbol,
            name: this.tokenName,
        };

        if (this.url !== null && this.url.trim() !== '') {
            payload.url = this.url;
        }

        if (this.maxSupply !== null && this.maxSupply.trim() !== '') {
            payload.maxSupply = this.maxSupply;
        }

        if (this.authorisedIssuingAccounts.length) {
            const accounts = this.authorisedIssuingAccounts.reduce((acc: string[], value) => {
                if (value.name.trim() !== '') {
                    acc.push(value.name);
                }
                return acc;
            }, []);

            if (accounts.length) {
                payload.authorizedIssuingAccounts = accounts;
            }
        }

        if (this.authorisedIssuingContracts.length) {
            const accounts = this.authorisedIssuingContracts.reduce((acc: string[], value) => {
                if (value.name.trim() !== '') {
                    acc.push(value.name);
                }
                return acc;
            }, []);

            if (accounts.length) {
                payload.authorisedIssuingContracts = accounts;
            }
        }

        const userHasFunds = this.tokenCreationFee <= this.engBalance;

        if (validationResult.valid && userHasFunds) {
            const result = await createTransaction(
                this.state.account.name,
                'nft',
                'create',
                payload,
                'Steem Engine NFT Creation',
                'nftCreateSuccess',
                'nftCreateError',
            );

            if (result !== false) {
                this.router.navigateToRoute('nft', { symbol: this.symbol });
            }
        }
    }
    info(e) {
        const hint = e;
        console.log(`let's display some components ${e}`);
        // $('.hidden-box').css('display', 'none');
        $('#here').html(hint);
    }
    handleNext(n) {
        console.log('next');
    }
    handlePrev(n) {
        console.log('previous');
    }
    
}
