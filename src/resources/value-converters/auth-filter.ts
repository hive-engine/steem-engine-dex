import { RouteConfig } from 'aurelia-router';
import { valueConverter } from 'aurelia-binding';

@valueConverter('authFilter')
export class AuthFilter {
    toView(routes: RouteConfig[], loggedIn: boolean, claims) {
        if (loggedIn) {
            return routes.filter(r => !r.config.publicOnly).filter((r2) => {
                // eslint-disable-next-line no-undef
                if (r2?.settings?.roles) {
                    return claims ? (Object.keys(claims).some(r => r2.settings.roles.includes(r))) : false;
                }

                return true;
            });
        }

        return routes.filter(r => !r.config.auth);
  }
}
