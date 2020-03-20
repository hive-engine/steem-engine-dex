import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../create-listing.module.css';

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
        let next = n + 1;
        let nextNext = n + 2;
        let prevPrev = n - 2;
        let prev = n - 1;
        $('#step-' + next).removeClass('active-form');
        $('#step-' + nextNext).removeClass('active-form');
        $('#step-' + prevPrev).addClass('active-form');
        $('#step-' + prev).addClass('active-form');
        
        console.log(`${next} and ${prev}`)
        console.log(`you asked for me ${n} times`);
    }
}
