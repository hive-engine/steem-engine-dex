import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from './loader.css';

@autoinject()
@customElement('loader')
export class Loader {
    private element: HTMLElement;
    private styles = styles;

    static inject = [Element];

    @bindable loading = false;
    @bindable mode = 'full';

    constructor(element: HTMLElement) {
        this.element = element;
    }

    loadingChanged(newVal) {
        if (newVal) {
            this.element.style.opacity = '1';
            this.element.style.display = 'block';

            if (this.mode === 'full') {
                document.body.style.overflow = 'hidden';
            }
        } else {
            this.element.style.opacity = '0';
            this.element.style.display = 'none';

            if (this.mode === 'full') {
                document.body.style.overflow = 'unset';
            }
        }
    }
}
