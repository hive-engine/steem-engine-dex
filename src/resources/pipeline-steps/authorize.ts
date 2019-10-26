import { Redirect, RouteConfig } from 'aurelia-router';
import firebase from 'firebase/app';
import { autoinject } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

@autoinject()
export class AuthorizeStep {
    constructor(private se: SteemEngine) {

    }

    run(navigationInstruction, next) {
        return new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(async (user) => {        
                let currentRoute: RouteConfig = navigationInstruction.config;
                
                let loginRequired = currentRoute.auth === true;
                
                if (!user && loginRequired === true) {
                    return resolve(next.cancel(new Redirect('')));
                }
                
                let publicOnly = currentRoute.publicOnly === true;
        
                if (user && publicOnly === true) {
                    return resolve(next.cancel(new Redirect('wallet')));
                }

                // The current route has settings and roles
                if (currentRoute.settings && currentRoute.settings.roles) {
                    const doc = await firebase.firestore().collection('users').doc(this.se.getUser()).get();
                    const data = doc.data();

                    // If the current user doesn't have every role configured in the route
                    if (!data.roles.some(r => currentRoute.settings.roles.includes(r))) {
                        return resolve(next.cancel(new Redirect('wallet')));
                    }
                }
                
                return resolve(next());
            });
        });
    }
}
