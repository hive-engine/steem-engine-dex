import { autoinject } from 'aurelia-framework';

import styles from './nft-market-contract-documentations.module.css';

@autoinject()
export class CreateNft {
    private styles = styles;

    handleScroll(e) {
        $('#example-top')[0].scrollIntoView();
        // $('#' + e + '-section')[0].scrollIntoView({ block: 'start' });
        $('.hide-section').css('display', 'none');
        $('#' + e + '-section').css('display', 'block');
    }

    scrollToTop() {
        $(window).scrollTop(250);
    }
}
