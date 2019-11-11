import { BootstrapFormRenderer } from './../../../resources/bootstrap-form-renderer';
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { SteemEngine } from 'services/steem-engine';
import { autoinject } from 'aurelia-framework';
import { Redirect, RouteConfig, AppRouter } from 'aurelia-router';

import 'firebase/storage';
import firebase from 'firebase/app';

@autoinject()
export class AdminKycView {
    private renderer: BootstrapFormRenderer;
    private validationController: ValidationController;
    private user;

    constructor(private se: SteemEngine, private controllerFactory: ValidationControllerFactory, private router: AppRouter) {
        this.validationController = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);
    }

    async canActivate(params: { uid: string }, routeConfig: RouteConfig) {
        if (!params.uid) {
            return new Redirect('admin');
        }

        const user = await firebase.firestore().collection('users').doc(params.uid).get();

        if (user.exists) {
            this.user = { id: user.id, ...user.data() };

            routeConfig.navModel.setTitle(`User ${this.user.id}`);
        }
    }
}
