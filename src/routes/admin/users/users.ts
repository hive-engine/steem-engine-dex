import { autoinject, PLATFORM } from 'aurelia-framework';
import { Router, RouterConfiguration } from 'aurelia-router';
import styles from './users.module.css';

@autoinject()
export class AdminUsers {
    private router: Router;
    private styles = styles;

    public configureRouter(config: RouterConfiguration, router: Router) {
        config.map([
            {
                route: [''],
                name: 'adminUsersLanding',
                moduleId: PLATFORM.moduleName('./users-list'),
                nav: false,
                title: 'Users'
            },
            {
                route: 'view/:uid',
                name: 'adminUserView',
                moduleId: PLATFORM.moduleName('./user-view'),
                nav: false,
                title: 'View'
            },
        ]);

        this.router = router;
    }
}
