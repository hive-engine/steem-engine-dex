import { AuthorizeStep } from './resources/pipeline-steps/authorize';
import { SteemEngine } from 'services/steem-engine';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Store, dispatchify } from 'aurelia-store';
import { environment } from './environment';
import { PostRenderStep } from './resources/pipeline-steps/postrender';
import { PreRenderStep } from './resources/pipeline-steps/prerender';
import { MaintenanceStep } from './resources/pipeline-steps/maintenance';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';
import { State } from 'store/state';
import { autoinject } from 'aurelia-framework';
import { SteemKeychain } from 'services/steem-keychain';
import firebase from 'firebase/app';
import { login, logout } from 'store/actions';

@autoinject()
export class App {
    private loggedIn = false;
    private loading = false;
    public router: Router;

    constructor(private ea: EventAggregator, private keychain: SteemKeychain, private store: Store<State>, private se: SteemEngine) {

    }

    bind() {
        this.store.state.subscribe((s: State) => {
            if (s) {
                this.loading = s.loading;
                this.loggedIn = s.loggedIn;
                }
        });
    }

    attached() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                dispatchify(login)(user.uid);
            } else {
                dispatchify(logout)();
            }
        });

        setTimeout(() => {
            if (window && window.steem_keychain) {
                window.steem_keychain.requestHandshake(() => {
                    this.keychain.useKeychain = true;
                });
            }
        }, 500);
    }

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Steem Engine';
        config.options.pushState = true;

        config.options.pushState = true;

        config.addPipelineStep('authorize', AuthorizeStep);
        config.addPipelineStep('authorize', MaintenanceStep);
        config.addPipelineStep('preRender', PreRenderStep);
        config.addPipelineStep('postRender', PostRenderStep);

        config.map([
            {
                route: ['', 'home'],
                name: 'home',
                moduleId: PLATFORM.moduleName('./routes/home'),
                nav: false,
                title: 'Home'
            },
            {
                route: 'wallet',
                name: 'wallet',
                moduleId: PLATFORM.moduleName('./routes/wallet/wallet'),
                auth: true,
                nav: false,
                title: 'Wallet'
            },
            {
                route: 'offerings',
                name: 'offerings',
                moduleId: PLATFORM.moduleName('./routes/offerings'),
                nav: 3,
                title: 'Offerings'
            },
            {
                route: 'tokens',
                name: 'tokens',
                moduleId: PLATFORM.moduleName('./routes/tokens'),
                nav: 1,
                title: 'Tokens',
            },
            {
                route: 'exchange/:symbol?',
                href: `exchange/${environment.NATIVE_TOKEN}`,
                name: 'exchange',
                moduleId: PLATFORM.moduleName('./routes/exchange/exchange'),
                nav: 0,
                title: 'Exchange'
            },
            {
                route: 'faq',
                name: 'faq',
                moduleId: PLATFORM.moduleName('./routes/faq'),
                nav: 4,
                title: 'Faq'
            },
            {
                route: 'rewards',
                name: 'rewards',
                moduleId: PLATFORM.moduleName('./routes/rewards'),
                nav: false,
                auth: true,
                title: 'Rewards',
            },
            {
                route: 'conversion-history',
                name: 'conversionHistory',
                moduleId: PLATFORM.moduleName('./routes/conversion-history'),
                nav: false,
                auth: true,
                title: 'Conversion History',
            },
            {
                route: 'settings',
                name: 'settings',
                moduleId: PLATFORM.moduleName('./routes/settings'),
                nav: false,
                auth: true,
                title: 'Settings',
            },
        ]);

        this.router = router;
    }
}
