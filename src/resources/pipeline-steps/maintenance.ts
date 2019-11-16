/* eslint-disable no-undef */
import firebase from 'firebase/app';
import { Redirect } from 'aurelia-router';

const ALLOWED_TO_BYPASS_MAINTENANCE = ['super', 'admin', 'moderator'];

export class MaintenanceStep {
    static inMaintenance = false;
    async run(navigationInstruction, next) {
        if (MaintenanceStep.inMaintenance && navigationInstruction.config.name !== 'maintenance') {
            const token = await firebase.auth()?.currentUser?.getIdTokenResult() ?? { claims: {} };
            const claims = Object.keys(token.claims);

            const hasClaims = claims.some(c => ALLOWED_TO_BYPASS_MAINTENANCE.includes(c));

            if (!hasClaims) {
                return next.cancel(new Redirect('maintenance'));
            }
        }

        return next();
    }
}
