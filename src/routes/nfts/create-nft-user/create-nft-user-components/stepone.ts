import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-nft-user.module.css';

@autoinject()
@customElement('stepone')
export class StepOne {
    private styles = styles;

    info(e) {
        const hint = e;
        console.log(`let's display some components ${e}`);
        // $('.hidden-box').css('display', 'none');
        $('#here').html(hint);
    }
}
