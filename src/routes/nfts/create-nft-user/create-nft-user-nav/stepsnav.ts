import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-nft-user.module.css';

@autoinject()
@customElement('stepsnav')
export class StepsNav {
    private styles = styles;
    // private n;
    @bindable clicked;

    handleClick(n) {
        $('.hide-ts').css('display', 'none');
        $('#tab-' + n).css('display', 'block');
        this.clicked = n;
        
        console.log(`you asked for me ${n} times`);
    }
}
