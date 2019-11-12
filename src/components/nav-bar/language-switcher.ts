import { SteemEngine } from './../../services/steem-engine';
import { customElement, autoinject, containerless } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';

import firebase from 'firebase/app';

import 'flag-icon-css/css/flag-icon.css';

@customElement('language-switcher')
@autoinject()
@containerless()
export class LanguageSwitcher {
    private languages = [
        { value: 'en', text: 'English (US)', icon: 'us' },
        { value: 'en-gb', text: 'English (British)', icon: 'gb' },
        { value: 'cn', text: 'Chinese', icon: 'cn' },
        { value: 'fr', text: 'French', icon: 'fr' },
        { value: 'kr', text: 'Korean', icon: 'kr' },
    ];

    private selectedLanguage = this.languages[0];

    constructor(private i18n: I18N, private se: SteemEngine) {

    }

    async attached() {
        try {
            const doc = await firebase.firestore().collection('users').doc(this.se.getUser()).get();

            if (doc.exists) {
                const user = doc.data();
    
                if (user.language) {
                    this.setLanguage(user.language);
                }
            }
        } catch {
            // Nothing
        }
    }

    setLanguage(language: any) {
        this.selectedLanguage = language;
        this.i18n.setLocale(language.value);

        const userRef = firebase.firestore().collection('users').doc(this.se.getUser());

        userRef.set({ language: this.selectedLanguage }, {
            merge: true
        });
    }
}
