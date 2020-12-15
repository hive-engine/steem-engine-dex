import { Router } from 'aurelia-router';
import { ToastMessage } from 'services/toast-service';
import { I18N } from 'aurelia-i18n';
import { dispatchify } from 'aurelia-store';
import { SeCatalogService } from 'services/se-catalog-service';
import { DialogController } from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import { ToastService } from 'services/toast-service';
import { login } from 'store/actions';
import { environment } from 'environment';

import styles from './signin.module.css';

@autoinject()
export class SigninModal {
  private styles = styles;
  private environment = environment;
  private loading = false;
  private usePrivateKey = false;
  private username;
  private privateKey;
  private useKeychain = false;

  constructor(private controller: DialogController, private se: SeCatalogService,
    private i18n: I18N, private router: Router, private toast: ToastService) {
    this.controller.settings.lock = false;
    this.controller.settings.centerHorizontalOnly = true;
  }

  attached() {
    if (window.steem_keychain) {
      window.steem_keychain.requestHandshake(() => {
        this.useKeychain = true;
      });
    }
  }

  async keychainSignIn() {
    try {
      this.loading = true;

      const { username } = await this.se.login(this.username.trim().toLowerCase()) as any;

      await dispatchify(login)(username);

      this.controller.close(true);

      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  async keySignIn() {
    try {
      this.loading = true;

      const { username } = await this.se.login(this.username.trim().toLowerCase(), this.privateKey.trim()) as any;

      await dispatchify(login)(username);

      this.controller.close(true);

      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }
}
