import { AppRouter } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';

@autoinject()
export class AdminHome {
    constructor(private router: AppRouter) {
        console.log(router);
    }
}
