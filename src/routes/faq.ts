import styles from "./faq.module.css";

export class Faq {
    private styles = styles;

    // To hide or show components conditionally
    handleClick(e) {
        $('.faq-detail').css('display', 'none');
        $('#'+e+'-question-tab').css('display', 'block');
    }
}
