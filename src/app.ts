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

    constructor(
        private ea: EventAggregator,
        private keychain: SteemKeychain,
        private store: Store<State>,
        private se: SteemEngine
    ) {
        authStateChanged();
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
                title: 'Tokens'
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
                title: 'Rewards'
            },
            {
                route: 'conversion-history',
                name: 'conversionHistory',
                moduleId: PLATFORM.moduleName('./routes/conversion-history'),
                nav: false,
                auth: true,
                title: 'Conversion History'
            },
            {
                route: 'settings',
                name: 'settings',
                moduleId: PLATFORM.moduleName('./routes/settings'),
                nav: false,
                auth: true,
                title: 'Settings'
            },
            {
                route: 'tribes',
                name: 'tribes',
                moduleId: PLATFORM.moduleName(
                    './routes/offering-routes/tribes'
                ),
                nav: false,
                title: 'Tribes'
            },
            {
                route: 'legal-services',
                name: 'legal-services',
                moduleId: PLATFORM.moduleName(
                    './routes/offering-routes/legal-services'
                ),
                nav: false,
                title: 'Legal Services',
            },
            {
                route: 'crowdfunding',
                name: 'crowdfunding',
                moduleId: PLATFORM.moduleName(
                    './routes/offering-routes/crowdfunding'
                ),
                nav: false,
                title: 'Crowdfunding',
            },
            {
                route: 'state-costs',
                name: 'state-costs',
                moduleId: PLATFORM.moduleName(
                    './routes/offering-routes/state-costs'
                ),
                nav: false,
                title: 'State Costs',
            },
            {
                route: "scotbot",
                name: "scotbot",
                moduleId: PLATFORM.moduleName(
                    "./routes/offering-routes/scotbot"
                ),
                nav: false,
                title: "Scotbot"
            },
            {
                route: 'admin',
                name: 'admin',
                moduleId: PLATFORM.moduleName('./routes/admin/admin'),
                nav: false,
                auth: true,
                title: 'Admin',
                settings: {
                    roles: ['super', 'admin']
                }
            }
        ]);

        this.router = router;
    }
}

async function authStateChanged() {
    return new Promise(resolve => {
        firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                dispatchify(login)(user.uid);
                resolve();
            } else {
                dispatchify(logout)();
                resolve();
            }
        });
    });
}
