import { customElement, autoinject, bindable } from 'aurelia-framework';
import { ssc } from 'common/ssc';
import { SteemEngine } from 'services/steem-engine';
import { Router } from 'aurelia-router';
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-undef */
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { loadAccountBalances } from 'store/actions';
import { Store, dispatchify } from 'aurelia-store';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { createTransaction } from 'common/functions';

import { environment } from 'environment';

import styles from '../add-service-listing.module.css';

@autoinject()
@customElement('stepthree')
export class StepThree {
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
        `<strong>Name of the collection</strong>
        <br>
        <small>(letters, numbers, whitespace only, max length of 50)</small> 
        <hr> What is the name of this project housing all of these collectable tokens? <br>
        <h4>Examples</h4>
        <ul>
            <li>Lunar Sorrow</li>
            <li>Shimmering Goddess</li>
            <li> Country Boys</li>
        </ul>`,
        `[OPTIONAL] URL of the project (max length of 255)`,
        `<strong>What inspired this collection?</strong>
        <br>
        <small>(letters, numbers, whitespace only, max length of 50)</small> 
        <hr> What idea inspired this collection? <br>
        <h4>Examples</h4>
        <p>The top hit songs in the 80s</p>`,
        `<strong>What is this collection about?</strong>
        <br>
        <small>(letters, numbers, whitespace only, max length of 50)</small> 
        <hr> Tell us what this collection represents <br>
        <h4>Examples</h4>
        <p>All the arts in this collection is a reminder of my grandma's painting</p>`,
        `[OPTIONAL] A list of Steem accounts which are authorized to issue new tokens on behalf of the NFT owner. If no list is provided, then the NFT owner (the account that calls create) will be the only such authorized account by default.`,
        `[REQUIRED] Symbol of the token (uppercase letters only, max length of 10)`,
        `[OPTIONAL] Maximum supply for the token (between 1 and 9,007,199,254,740,991). If max supply is not specified, then the supply will be unlimited.`,
        `[REQUIRED] This will be the a link that leads to the main image associated with this collection.<hr>You will not be able to edit this link later so make sure it is the right one.`,
        `[REQUIRED] Mark this collection as Not Safe for Work?`,
        `[REQUIRED] Do you have all the legal permission to create this collection?`,
    ];

    @bindable testing;

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
            .on(StepThree);
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
    handleNext(m) {
        $('.custom-tabs').css('display', 'none');
        $('#' + m + '-btn').css('display', 'block');
        $('#go-back').css('display', 'block');
        $('.tab-4').css('display', 'block');
        console.log('#' + m + '-btn');
        $('#step-4').addClass('active-form');
        showPreview();
        // To scroll page back to top on click
        document.documentElement.scrollTop = 250; // Chrome, FireFox, IE and Opera
        document.body.scrollTop = 250; // For Safari

        function showPreview() {
            //show final data
            let storeName = $('.storeName-placeholder')
                .val()
                .toString();
            let name = $('.name-placeholder')[0].innerText;
            let price = $('.price-placeholder')[0].innerText;
            let sym = $('.symbol-placeholder')[0].innerText;
            let max = $('.max-placeholder')[0].innerText;
            let id = $('.id-placeholder')[0].innerText;
            let bodyContent = $('.body-placeholder')[0].innerText;

            console.log(storeName);
            let pStore = $('#storeName-placeholder').text(storeName);
            console.log(pStore);

            $('#storeName-placeholder').text(storeName);
            $('#name-placeholder').text(name);
            $('#price-placeholder').text(price);
            $('#symbol-placeholder').text(sym);
            $('#max-placeholder').text(max);
            $('#id-placeholder').text(id);
            $('#body-placeholder').text(bodyContent);
        }
    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);

        $('#step-3').removeClass('active-form');
        // To scroll page back to top on click
        document.documentElement.scrollTop = 250; // Chrome, FireFox, IE and Opera
        document.body.scrollTop = 250; // For Safari
    }
    showNftCards() {
        $('.add-nft-cards').css('display', 'block');
    }
    showNftForm() {
        $('.nft-form-wrapper').css('display', 'block');
    }
}
