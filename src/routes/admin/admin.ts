import { PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';

export class AdminAdmin {
    private router: Router;
    
    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: ['', 'home'],
                name: 'adminHome',
                moduleId: PLATFORM.moduleName('./home'),
                nav: true,
                title: 'Home'
            },
            {
                route: 'kyc',
                name: 'adminKyc',
                moduleId: PLATFORM.moduleName('./kyc/kyc'),
                nav: true,
                title: 'Kyc'
            },
            {
                route: 'residency',
                name: 'adminResidency',
                moduleId: PLATFORM.moduleName('./residency/residency'),
                nav: true,
                title: 'Residency'
            },
            {
                route: 'users',
                name: 'adminUsers',
                moduleId: PLATFORM.moduleName('./users/users'),
                nav: true,
                title: 'Users'
            },
            {
                route: 'tokens',
                name: 'adminTokens',
                moduleId: PLATFORM.moduleName('./tokens'),
                nav: true,
                title: 'Tokens'
            }
        ]);

        this.router = router;
    }
}
