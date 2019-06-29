import { valueConverter } from 'aurelia-binding';

@valueConverter('authFilter')
export class AuthFilter {
  toView(routes, loggedIn) {
    if (loggedIn) {
      return routes.filter(r => !r.config.publicOnly);
    }

    return routes.filter(r => !r.config.auth);
  }
}
