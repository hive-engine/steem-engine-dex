import { AppRouter } from 'aurelia-router';
import '@babel/polyfill';
import 'bootstrap';
import { Aurelia } from 'aurelia-framework';
import { environment } from './environment';
import { PLATFORM } from 'aurelia-pal';
import { initialState } from './store/state';
import { TCustomAttribute } from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend';

import 'datatables.net-bs4';
import 'datatables.net-responsive-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';

import 'sscjs/dist/ssc';

import '!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css';
import '!style-loader!css-loader!font-awesome/css/font-awesome.min.css';
import '!style-loader!css-loader!izitoast/dist/css/iziToast.css';
import '!style-loader!css-loader!./styles/toast.css';
import '!style-loader!css-loader!./styles/main.css';

import modalCss from '!style-loader!css-loader!./styles/modal.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faGlobe, faFlagUsa, faPoundSign } from '@fortawesome/free-solid-svg-icons';
import { EventAggregator } from 'aurelia-event-aggregator';

library.add(faGlobe as any, faFlagUsa as any, faPoundSign as any);

export async function configure(aurelia: Aurelia) {
    aurelia.use
        .standardConfiguration()
        .feature(PLATFORM.moduleName('resources/index'))
        .feature(PLATFORM.moduleName('components/index'))

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
          ns: ['translation', 'headings', 'buttons', 'titles'],
          defaultNS: 'translation',
          fallbackLng: 'en',
          debug : false
        }).then(() => {
            const router = aurelia.container.get(AppRouter);

            router.transformTitle = title => instance.tr(`titles:${title}`);

            const eventAggregator = aurelia.container.get(EventAggregator);
            eventAggregator.subscribe('i18n:locale:changed', () => {
              router.updateTitle();
            });
        });
    });

    await aurelia.start();

    aurelia.setRoot(PLATFORM.moduleName('app'));
}
