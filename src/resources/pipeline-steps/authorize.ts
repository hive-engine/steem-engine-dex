import { Redirect } from 'aurelia-router';
import firebase from 'firebase/app';

export class AuthorizeStep {
  run(navigationInstruction, next) {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(user => {        
            let currentRoute = navigationInstruction.config;
            
            let loginRequired = currentRoute.auth === true;
            
            if (!user && loginRequired === true) {
                return resolve(next.cancel(new Redirect('')));
            }
            
            let publicOnly = currentRoute.publicOnly === true;
    
            if (user && publicOnly === true) {
                return resolve(next.cancel(new Redirect('wallet')));
            }
            
            return resolve(next());
        });
    });
  }
}
