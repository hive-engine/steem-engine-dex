import { ssc } from 'common/ssc';
import { SteemEngine } from 'services/steem-engine';
import { Router } from 'aurelia-router';
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-undef */
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { loadAccountBalances } from 'store/actions';
import { Store, dispatchify } from 'aurelia-store';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { autoinject } from 'aurelia-framework';
import { createTransaction } from 'common/functions';

import { environment } from 'environment';
import styles from './create-listing.module.css';
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
    private orgName = null;
    private productName = null;
    private authorisedIssuingAccounts: any[] = [];
    private authorisedIssuingContracts: any[] = [];

    private state: State;
    private environment = environment;
    private styles = styles;

    private hints = [
        `[REQUIRED] Enter an account name or group name for the store`,
        `<strong>Name of the Store listing this item?</strong>
        <br>
        <small>(letters, numbers, whitespace only, max length of 50)</small> 
        <hr> What is the name of this store housing all of these collectable tokens? <br>
        <h4>Examples</h4>
        <ul>
            <li>Toshiba Mart</li>
            <li>Winter Malls</li>
            <li> Country Side</li>
        </ul>`,
        `<strong>What is the category of this item?</strong>
        <br>
        <small>Select from the list</small> 
        <hr> What keywords will help others find this item easily? <br>
        <h4>Examples</h4>
        <p>The top hit songs in the 80s</p>`,
        `<strong>Is this item for sale or wanted by you?</strong>
        <br>
        <h4>Examples</h4>
        <small>(Make a choice from both radio buttons)</small> 
        <hr> <strong>Offered</strong> means you are listing this item to sell this item <br>
        <hr> <strong>Wanted</strong> means, you are listing this item to buy this item </p>`,
        `[OPTIONAL]  Choose a language that you would like others to communicate with you. English will be the language by default.`,
        `[OPTIONAL] Choose a currency that you would like to be paid in. USD will be the default currency`,
        `[REQUIRED] Do you want to save your inputs before proceeding?`,
    ];

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
    info(index) {
        const hint = this.hints[parseInt(index)];
        // $('.hidden-box').css('display', 'none');
        $('#here').html(hint);
    }

    handleNext(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        $('.step').addClass('active');
        console.log(n);
        $('#step-' + n).addClass('active-form');
        // To scroll page back to top on click
        document.documentElement.scrollTop = 250; // Chrome, FireFox, IE and Opera
        document.body.scrollTop = 250; // For Safari
    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);

        $('#step-4').removeClass('active-form');
        // To scroll page back to top on click
        document.documentElement.scrollTop = 250; // Chrome, FireFox, IE and Opera
        document.body.scrollTop = 250; // For Safari
    }
    testing() {
        console.log('testing 123...');
    }
}
