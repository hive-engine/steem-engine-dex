import { log } from './../../services/log';
import { Redirect, RouteConfig } from 'aurelia-router';
import firebase from 'firebase/app';
import { autoinject } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

@autoinject()
export class AuthorizeStep {
    constructor(private se: SteemEngine) {

    }

    run(navigationInstruction, next) {
        return new Promise((resolve) => {
            firebase.auth().onAuthStateChanged(async (user) => {        
                const currentRoute: RouteConfig = navigationInstruction.config;
                
                const loginRequired = currentRoute.auth === true;
                
                if (!user && loginRequired === true) {
                    return resolve(next.cancel(new Redirect('')));
                }
                
                const publicOnly = currentRoute.publicOnly === true;
        
                if (user && publicOnly === true) {
                    return resolve(next.cancel(new Redirect('wallet')));
                }

                // The current route has settings and roles
                if (currentRoute.settings && currentRoute.settings.roles) {
                    const token = await firebase.auth().currentUser.getIdTokenResult();

                    log.debug('Current route requires roles', token);

                    // If the current user doesn't have every role configured in the route
                    if (!Object.keys(token.claims).some(r => currentRoute.settings.roles.includes(r))) {
                        return resolve(next.cancel(new Redirect('wallet')));
                    }
                }
                
                return resolve(next());
            });
        });
    }
}
