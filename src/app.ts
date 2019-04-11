import { PostRenderStep } from './resources/pipeline-steps/postrender';
import { PreRenderStep } from './resources/pipeline-steps/prerender';
import { MaintenanceStep } from './resources/pipeline-steps/maintenance';
import { PLATFORM } from 'aurelia-pal';
import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
    public router: Router;

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.title = 'Steem Engine';

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
                route: 'sign-in',
                name: 'signin',
                moduleId: PLATFORM.moduleName('./routes/sign-in'),
                nav: false,
                title: 'Signin'
            },
            {
                route: 'wallet',
                name: 'wallet',
                moduleId: PLATFORM.moduleName('./routes/wallet'),
                nav: true,
                title: 'Wallet'
            },
            {
                route: 'tokens',
                name: 'tokens',
                moduleId: PLATFORM.moduleName('./routes/tokens'),
                nav: true,
                title: 'Tokens'
            },
            {
                route: 'market',
                name: 'market',
                moduleId: PLATFORM.moduleName('./routes/market'),
                nav: true,
                title: 'Market'
            },
            {
                route: 'faq',
                name: 'faq',
                moduleId: PLATFORM.moduleName('./routes/faq'),
                nav: true,
                title: 'Faq'
            }
        ]);

        this.router = router;
    }
}
