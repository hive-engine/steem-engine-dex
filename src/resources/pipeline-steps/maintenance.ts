import environment from 'environment';
import { Redirect } from 'aurelia-router';

export class MaintenanceStep {
    run(navigationInstruction, next) {
        if (environment.MAINTENANCE_MODE && navigationInstruction.config.name !== 'maintenance') {
            return next.cancel(new Redirect('maintenance'));
        }

        return next();
    }
}
