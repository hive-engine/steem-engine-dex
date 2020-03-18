import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-listing.module.css';

@autoinject()
@customElement('steptwo')
export class StepTwo {
    private styles = styles;

    handleNext(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
        $('.step-'+n).addClass('active-form');
    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
        $('.step-2').removeClass('active-form');
    }
}
