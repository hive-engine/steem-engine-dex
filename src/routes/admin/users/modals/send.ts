import { BootstrapFormRenderer } from './../../../../resources/bootstrap-form-renderer';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';

import firebase from 'firebase/app';

@autoinject()
export class SendNotification {
    private renderer: BootstrapFormRenderer;
    private validationController: ValidationController;

    private user;

    private notification = {
        type: 'info',
        message: '',
        date: new Date(),
        read: false
    };

    constructor(private controllerFactory: ValidationControllerFactory, private controller: DialogController) {
        this.validationController = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validationController.addRenderer(this.renderer);

        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;
    }

    async activate({userId}) {
        this.notification = {
            type: 'info',
            message: '',
            date: new Date(),
            read: false
        };

        const user = await firebase.firestore().collection('users').doc(userId).get();

        if (user.exists) {
            this.user = { id: user.id, ...user.data() };
        }
    }

    async send() {
        const userRef = firebase.firestore().collection('users').doc(this.user.id);

        this.user.notifications = this.user.notifications ?? [];
        
        this.user.notifications.push(this.notification);

        try {
            await userRef.set({ notifications: this.user.notifications }, {
                merge: true
            });

            this.controller.close(true);
        } catch (e) {
            console.error(e);
        }
    }
}
