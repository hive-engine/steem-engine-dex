import { dispatchify } from 'aurelia-store';
import { sleep } from 'common/functions';
import { checkTransaction } from 'common/steem-engine';
import { I18N } from 'aurelia-i18n';
import { ToastService, ToastMessage } from 'services/toast-service';
import { BootstrapFormRenderer } from 'resources/bootstrap-form-renderer';
import { ValidationControllerFactory, ValidationController, ValidationRules } from 'aurelia-validation';
import { customJson } from 'common/keychain';
import { SteemEngine } from 'services/steem-engine';
import { DialogController } from 'aurelia-dialog';
import { autoinject, TaskQueue } from 'aurelia-framework';

import styles from './nft-edit.module.css';

import { environment } from 'environment';
import { loading } from 'store/actions';

@autoinject()
export class NftEditModal {
    private styles = styles;
    private validation: ValidationController;
    private renderer: BootstrapFormRenderer;

    private loading = false;
    private token;
    private errors: string[] = [];

    private url;
    private icon;
    private name;

    private selectedTab = 'name';

    constructor(private controllerFactory: ValidationControllerFactory, private i18n, I18N, private toast: ToastService, private controller: DialogController, private se: SteemEngine, private taskQueue: TaskQueue) {
        this.controller.settings.lock = false;
        this.controller.settings.centerHorizontalOnly = true;

        this.validation = controllerFactory.createForCurrentScope();

        this.renderer = new BootstrapFormRenderer();
        this.validation.addRenderer(this.renderer);
    }

    private bind() {
        ValidationRules.ensure('name')
            .maxLength(50)
                .withMessageKey('errors:maximumLength50')
            .satisfies((value: string) => {
                return value?.match(/^[a-zA-Z0-9 ]*$/)?.length > 0 ?? false;
            })
                .withMessageKey('errors:requiredAlphaNumericSpaces')
            .on(NftEditModal);
    }

    async activate(token) {
        this.token = token;

        this.name = token.name;
    }

    async updateName() {
        dispatchify(loading)(true);

        const payload = {
            contractName: 'nft',
            contractAction: 'updateName',
            contractPayload: {
                symbol: this.token.symbol,
                name: this.name
            }
        };

        if (window.steem_keychain) {
            const response = await customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(payload), `Update Name`);

            if (response.success) {
                try {
                    const verify = await checkTransaction(response.result.id, 3);

                    if (verify?.errors) {
                        this.errors = verify.errors;
                    } else {
                        await sleep(3200);

                        const toast = new ToastMessage();

                        toast.message = this.i18n.tr('saveSuccess', {
                            ns: 'notifications'
                        });
        
                        this.toast.success(toast);

                        this.controller.ok();
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                const toast = new ToastMessage();

                toast.message = this.i18n.tr('transactionError', {
                    ns: 'notifications'
                });

                this.toast.error(toast);
            }
        }

        dispatchify(loading)(false);
    }
}
