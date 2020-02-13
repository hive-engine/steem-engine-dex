import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-nft-user.module.css';

@autoinject()
@customElement('stepthree')
export class StepThree {
    private styles = styles;
    
    handleNext(m) {
        $('.custom-tabs').css('display', 'none');
        $('#' + m + '-btn').css('display', 'block');
        $('.tab-4').css('display', 'block');
        console.log('#' + m + '-btn');
        $('.step-4').addClass('active-form');
        
        //show final data
        let price = $('.price-placeholder').text;

        console.log(price);
        
    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
        
        $('.step-3').removeClass('active-form');
    }
}
