import { Router, RouterConfiguration } from 'aurelia-router';
import { PLATFORM } from 'aurelia-framework';

export class AdminResidency {
    private router: Router;

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: [''],
                name: 'adminResidencyLanding',
                moduleId: PLATFORM.moduleName('./residency-queue'),
                nav: false,
                title: 'Residency'
            },
            {
                route: 'view/:uid',
                name: 'adminResidencyView',
                moduleId: PLATFORM.moduleName('./residency-view'),
                nav: false,
                title: 'View'
            },
        ]);

        this.router = router;
    }
}
