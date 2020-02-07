import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-nft-user.module.css';

@autoinject()
@customElement('stepthree')
export class StepThree {
    private styles = styles;

    handleNext(n) {
        $('.custom-tabs').css('display', 'none');
        $('#' + n + '-btn').css('display', 'block');
        console.log('#' + n + '-btn');
    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
    }
}
