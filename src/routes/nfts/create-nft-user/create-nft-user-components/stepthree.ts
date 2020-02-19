import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-nft-user.module.css';

@autoinject()
@customElement('stepthree')
export class StepThree {
    private styles = styles;
    
    handleNext(m) {
        $('.custom-tabs').css('display', 'none');
        $('#' + m + '-btn').css('display', 'block');
        $('#go-back').css('display', 'block');
        $('.tab-4').css('display', 'block');
        console.log('#' + m + '-btn');
        $('.step-4').addClass('active-form');
        showPreview();
      
        function showPreview() {
            //show final data
        let price = $('.price-placeholder')[0].innerText;
        let sym = $('.symbol-placeholder')[0].innerText;
        let max = $('.max-placeholder')[0].innerText;
        let id = $('.id-placeholder')[0].innerText;
        let bodyContent = $('.body-placeholder')[0].innerText;

        $('#price-placeholder').text(price);
        $('#symbol-placeholder').text(sym);
        $('#max-placeholder').text(max);
        $('#id-placeholder').text(id);
        $('#body-placeholder').text(bodyContent);
       };

    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
        
        $('.step-3').removeClass('active-form');
    }
}
