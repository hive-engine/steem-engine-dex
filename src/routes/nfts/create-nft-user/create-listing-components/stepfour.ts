import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-listing.module.css';

@autoinject()
@customElement('stepfour')
export class StepFour {
    private styles = styles;
    @bindable selected;

    
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
        this.selected = n;

        $('#step-4').removeClass('active-form');
    }
}
