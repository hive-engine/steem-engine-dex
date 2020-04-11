import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../../edit-profile.module.css';

@autoinject()
@customElement('sidebar')
export class SideBar {
    private styles = styles;
    // private n;
    @bindable clicked;

    handleClick(n) {
        $('.removeActivate').removeClass('activateIt');
        $('#'+n).addClass('activateIt');
        $('.core-forms').css('display', 'none');
        $('#'+n+'Form').css('display', 'block');
        console.log('Hello from side bar');
        // To scroll page back to top on click
        document.documentElement.scrollTop = 0; // Chrome, FireFox, IE and Opera
        document.body.scrollTop = 0; // For Safari
    }
}
