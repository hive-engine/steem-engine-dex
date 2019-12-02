import { SendNotification } from './modals/send';
import { DialogService } from 'aurelia-dialog';
import { BootstrapFormRenderer } from './../../../resources/bootstrap-form-renderer';
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';
import { Redirect, RouteConfig, AppRouter } from 'aurelia-router';

import 'firebase/storage';
import firebase from 'firebase/app';

@autoinject()
export class AdminKycView {
    private renderer: BootstrapFormRenderer;
    private validationController: ValidationController;
    private user;

    constructor(private se: SteemEngine, private controllerFactory: ValidationControllerFactory, private router: AppRouter, private dialogService: DialogService, private taskQueue: TaskQueue) {
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

            if (!this.user?.admin) {
                this.user.admin = false;
            }

            if (!this.user?.kycAuditor) {
                this.user.kycAuditor = false;
            }

            if (!this.user?.disable) {
                this.user.disable = false;
            }

            routeConfig.navModel.setTitle(`User ${this.user.id}`);
        }
    }

    notifyModal() {
        this.dialogService.open({ viewModel: SendNotification, model: { userId: this.user.id } }).whenClosed(response => {
            console.log(response);
        });
    }

    updateSettings() {
        this.taskQueue.queueMicroTask(() => {
            const data = { ...this.user };
            delete data.id;

            const userRef = firebase.firestore().collection('users').doc(this.user.id);

            userRef.update(data);
        });
    }
}
