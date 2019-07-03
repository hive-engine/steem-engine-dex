import { customElement, autoinject, containerless } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';

import 'flag-icon-css/css/flag-icon.css';

@customElement('language-switcher')
@autoinject()
@containerless()
export class LanguageSwitcher {
    private languages = [
        { value: 'en', text: 'English (US)', icon: 'us' },
        { value: 'en-GB', text: 'English (British)', icon: 'gb' },
        { value: 'zh', text: 'Chinese', icon: 'cn' },
    ];

    private selectedLanguage = this.languages[0];

    constructor(private i18n: I18N) {

    }

    setLanguage(language: any) {
        this.selectedLanguage = language;
        this.i18n.setLocale(language.value);
    }
}
