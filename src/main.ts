import '@babel/polyfill';
import 'bootstrap';
import { Aurelia } from 'aurelia-framework';
import environment from './environment';
import { PLATFORM } from 'aurelia-pal';
import { initialState } from './store/state';
import { TCustomAttribute } from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';

import 'sscjs/dist/ssc';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import '!style-loader!css-loader!./styles/main.css';

import modalCss from './styles/modal.css';

export function configure(aurelia: Aurelia) {
    aurelia.use
        .standardConfiguration()
        .feature(PLATFORM.moduleName('resources/index'));

    aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

    if (environment.testing) {
        aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
    }

    aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-async-binding'));
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-portal-attribute'));
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-fetch-client'));
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-fontawesome'));

    aurelia.use.plugin(PLATFORM.moduleName('aurelia-store', 'store'), {
        initialState: initialState,
        history: {
            undoable: false,
            limit: 10
        }
    });

    aurelia.use.plugin(PLATFORM.moduleName('aurelia-dialog'), config => {
        config
            .useDefaults()
            .useCSS(modalCss)
    });

    aurelia.use.plugin(PLATFORM.moduleName('aurelia-i18n'), (instance) => {
        let aliases = ['t', 'i18n'];
        TCustomAttribute.configureAliases(aliases);
  
        // register backend plugin
        instance.i18next.use(Backend);
  
        return instance.setup({
          backend: {
            loadPath: './locales/{{lng}}/{{ns}}.json',
          },
          attributes: aliases,
          lng: environment.defaultLocale,
          ns: ['translation', 'headings', 'buttons'],
          defaultNS: 'translation',
          fallbackLng: 'en',
          debug : false
        });
    });

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
