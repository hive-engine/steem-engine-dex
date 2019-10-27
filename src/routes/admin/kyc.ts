import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-framework';

export class AdminKyc {
    private router: Router;

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: [''],
                name: 'adminKycLanding',
                moduleId: PLATFORM.moduleName('./kyc-queue'),
                nav: false,
                title: 'KYC'
            },
            {
                route: 'view/:uid',
                name: 'adminKycView',
                moduleId: PLATFORM.moduleName('./kyc-view'),
                nav: false,
                title: 'Kyc View'
            },
        ]);

        this.router = router;
    }
}
