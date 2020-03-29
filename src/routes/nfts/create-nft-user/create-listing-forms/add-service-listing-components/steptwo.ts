import { customElement, autoinject, bindable } from 'aurelia-framework';

import styles from '../add-service-listing.module.css';

@autoinject()
@customElement('steptwo')
export class StepTwo {
    private styles = styles;
    private hints = [
        `<strong>Name of the Item</strong>
        <br>
        <small>(letters, numbers, whitespace only, max length of 50)</small> 
        <hr> What is the name of this project housing all of these collectable tokens? <br>
        <h4>Examples</h4>
        <ul>
            <li>Lunar Sorrow</li>
            <li>Shimmering Goddess</li>
            <li> Country Boys</li>
        </ul>`,
        `<strong>What is the category of this item?</strong>
        <br>
        <small>Select from the list</small> 
        <hr> What keywords will help others find this item easily? <br>
        <h4>Examples</h4>
        <p>The top hit songs in the 80s</p>`,
        `<strong>Is this item for sale or wanted by you?</strong>
        <br>
        <h4>Examples</h4>
        <small>(Make a choice from both radio buttons)</small> 
        <hr> <strong>Offered</strong> means you are listing this item to sell this item <br>
        <hr> <strong>Wanted</strong> means, you are listing this item to buy this item </p>`,
        `[OPTIONAL]  Choose a language that you would like others to communicate with you. English will be the language by default.`,
        `[OPTIONAL] Choose a currency that you would like to be paid in. USD will be the default currency`,
        `[REQUIRED] Do you want to save your inputs before proceeding?`,
    ];

    info(index) {
        const hint = this.hints[parseInt(index)];
        // $('.hidden-box').css('display', 'none');
        $('#here').html(hint);
    }

    handleNext(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
        $('#step-' + n).addClass('active-form');
    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);
        $('#step-2').removeClass('active-form');
    }

    testing() {
        console.log('testing 123...')
    }
}
