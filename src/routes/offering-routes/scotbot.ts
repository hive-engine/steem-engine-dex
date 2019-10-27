import styles from "./scotbot.module.css";

export class Scotbot {
    private styles = styles;

    // To hide or show components conditionally
    handleClick(e) {
        $(".scotbot-detail").css("display", "none");
        $("#" + e).css("display", "block");
        $("#" + e + "-hint").css("display", "block");
    }
}
