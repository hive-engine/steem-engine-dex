import { bindable, containerless, customElement } from 'aurelia-framework';

@customElement('tooltip')
export class Tooltip {
    @bindable() text;

    public attached() {
        $(document).ready(() => {
            // @ts-ignore
            $('[data-toggle="tooltip"]').tooltip();
        });
    }
}
