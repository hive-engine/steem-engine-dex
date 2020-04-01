import styles from './add-service-listing.module.css';

export class CreateNftUser {
    private styles = styles;

    private hints = [
        `[REQUIRED] Enter an account name or group name for the store`,
        `<strong>Name of the Store listing this item?</strong>
        <br>
        <small>(letters, numbers, whitespace only, max length of 50)</small> 
        <hr> What is the name of this store housing all of these collectable tokens? <br>
        <h4>Examples</h4>
        <ul>
            <li>Toshiba Mart</li>
            <li>Winter Malls</li>
            <li> Country Side</li>
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
        $('.step').addClass('active');
        console.log(n);
        $('#step-' + n).addClass('active-form');
        // To scroll page back to top on click
        document.documentElement.scrollTop = 250; // Chrome, FireFox, IE and Opera
        document.body.scrollTop = 250; // For Safari
    }
    handlePrev(n) {
        $('.custom-tabs').css('display', 'none');
        $('.tab-' + n).css('display', 'block');
        console.log(n);

        $('#step-4').removeClass('active-form');
        // To scroll page back to top on click
        document.documentElement.scrollTop = 250; // Chrome, FireFox, IE and Opera
        document.body.scrollTop = 250; // For Safari
    }
    testing() {
        console.log('testing 123...');
    }
}
