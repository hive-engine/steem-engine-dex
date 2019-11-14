import { pluck } from 'rxjs/operators';
import { State } from './../store/state';
import { Store } from 'aurelia-store';
import { autoinject } from 'aurelia-framework';
import { Subscription } from 'rxjs';

@autoinject()
export class Settings {
    private settings;
    private subscription: Subscription;

    constructor(private store: Store<State>) {
        this.subscription = this.store.state.pipe(pluck('settings')).subscribe((settings) => {
            this.settings = settings;
        });
    }

    public property(name, defaultValue = '') {
        // eslint-disable-next-line no-undef
        return this?.settings[name] ?? defaultValue;
    }

    public properties() {
        return this.settings ?? [];
    }

    private unbind() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
