import styles from './advertise-tribe.module.css';

export class advertiseTribes {
    private styles = styles;
    handleClick(e) {
        $('.faq-content').css('display', 'none');
        $('#faq' + e + 'Content').css('display', 'block');
        // $('.faq-item' + e ).addClass('active');
        // $('.faq-items').removeClass('active');
    }
}
