import { Settings } from './services/settings';
import { CallingAction, MiddlewarePlacement } from 'aurelia-store';
/* eslint-disable no-undef */
import { AuthorizeStep } from './resources/pipeline-steps/authorize';
import { SteemEngine } from 'services/steem-engine';
import { EventAggregator, Subscription } from 'aurelia-event-aggregator';
import { Store, dispatchify } from 'aurelia-store';
import { environment } from './environment';
import { PostRenderStep } from './resources/pipeline-steps/postrender';
import { PreRenderStep } from './resources/pipeline-steps/prerender';
import { MaintenanceStep } from './resources/pipeline-steps/maintenance';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration, RouterEvent } from 'aurelia-router';
import { State } from 'store/state';
import { autoinject } from 'aurelia-framework';

import { getCurrentFirebaseUser, markNotificationsRead } from 'store/actions';

function lastCalledActionMiddleware(state: State, originalState: State, settings = {}, action: CallingAction) {
    state.$action = {
        name: action.name,
        params: action.params ?? {}
    };

    return state;
}

@autoinject()
export class App {
    private loggedIn = false;
    private loading = false;
    private claims;
    private notifications = [];

    public router: Router;
    public subscription: Subscription;
    private state: State;

    constructor(private ea: EventAggregator, private store: Store<State>, private se: SteemEngine, private settings: Settings) {
        this.store.registerMiddleware(lastCalledActionMiddleware, MiddlewarePlacement.After);
    }

    bind() {
        this.store.state.subscribe((s: State) => {
            if (s) {
                this.state = s;
                                
                this.loading = s.loading;
                this.loggedIn = s.loggedIn;
                this.claims = s?.account?.token?.claims;
                this.notifications = s?.firebaseUser?.notifications ?? [];
            }
        });

        this.subscription = this.ea.subscribe(RouterEvent.Complete, () => {
            dispatchify(getCurrentFirebaseUser)();
            dispatchify(markNotificationsRead)();
        });
    }

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.title = this.settings.property('siteName', 'Steem Engine');

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
                route: 'token-history/:symbol?',
                href: `token-history/${environment.NATIVE_TOKEN}`,
                name: 'token-history',
                moduleId: PLATFORM.moduleName('./routes/wallet/token-history'),
                nav: false,
                title: 'Token History'
            },
            {
                route: 'pending-undelegations',
                href: `pending-undelegations`,
                name: 'pending-undelegations',
                moduleId: PLATFORM.moduleName('./routes/wallet/pending-undelegations'),
                nav: false,
                title: 'Pending undelegations'
            },
            {
                route: 'pending-unstakes',
                href: `pending-unstakes`,
                name: 'pending-unstakes',
                moduleId: PLATFORM.moduleName('./routes/wallet/pending-unstakes'),
                nav: false,
                title: 'Pending unstakes'
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
                moduleId: PLATFORM.moduleName('./routes/account/rewards'),
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
                moduleId: PLATFORM.moduleName('./routes/account/settings'),
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
                route: "state-costs",
                name: "state-costs",
                moduleId: PLATFORM.moduleName(
                    "./routes/offering-routes/state-costs"
                ),
                nav: false,
                title: "State Costs"
            },
            {
                route: 'admin',
                name: 'admin',
                moduleId: PLATFORM.moduleName('./routes/admin/admin'),
                nav: true,
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
