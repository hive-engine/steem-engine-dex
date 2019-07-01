import { Redirect } from 'aurelia-router';

export class AuthorizeStep {
  static loggedIn = false;

  run(navigationInstruction, next) {
    let isLoggedIn = AuthorizeStep.loggedIn;
    
    let currentRoute = navigationInstruction.config;
    
    let loginRequired = currentRoute.auth === true;
    
    if (isLoggedIn === false && loginRequired === true) {
        return next.cancel(new Redirect(''));
    }
    
    let publicOnly = currentRoute.publicOnly === true;

    if (isLoggedIn === true && publicOnly === true) {
      return next.cancel(new Redirect('wallet'));
    }
    
    return next();
  }
}
