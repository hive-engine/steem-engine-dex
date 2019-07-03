import '@babel/polyfill';
import 'bootstrap';
import 'datatables.net-bs4';
import 'datatables.net-responsive-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import 'datatables.net-bs4';
import 'datatables.net-responsive-bs4';
import 'datatables.net-bs4/css/dataTables.bootstrap4.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'izitoast/dist/css/iziToast.css';
import './styles/toast.css';
import './styles/main.css';

import modalCss from './styles/modal.css';

import 'sscjs/dist/ssc';

import { SteemEngine } from 'services/steem-engine';
import { AppRouter } from 'aurelia-router';
import { Aurelia, Container, LogManager } from 'aurelia-framework';
import { ConsoleAppender } from 'aurelia-logging-console';
import { environment } from './environment';
import { PLATFORM } from 'aurelia-pal';
import { initialState } from './store/state';
import { TCustomAttribute, I18N } from 'aurelia-i18n';
import { ValidationMessageProvider } from 'aurelia-validation';
import Backend from 'i18next-xhr-backend';

import steem from 'steem';
import Mousetrap from 'mousetrap';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faGlobe, faFlagUsa, faPoundSign } from '@fortawesome/free-solid-svg-icons';
import { EventAggregator } from 'aurelia-event-aggregator';
import { dispatchify } from 'aurelia-store';
import { login } from 'store/actions';

LogManager.addAppender(new ConsoleAppender());

library.add(faGlobe as any, faFlagUsa as any, faPoundSign as any);

const SE: SteemEngine = Container.instance.get(SteemEngine);

// Disable connect queue to speed up application
import { disableConnectQueue } from 'aurelia-binding';
disableConnectQueue();

Mousetrap.bind('ctrl+shift+f10', () => {
    console.debug('Enabling debug mode');
    LogManager.setLevel(LogManager.logLevel.debug);
});

SE.loadSteemPrice();

setInterval(() => {
    SE.loadSteemPrice();
}, 300000);

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
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-validation'));
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
            .useCSS(modalCss.toString());
    });

    aurelia.use.plugin(PLATFORM.moduleName('aurelia-i18n'), (instance) => {
        let aliases = ['t', 'i18n'];
        TCustomAttribute.configureAliases(aliases);
  
        // register backend plugin
        instance.i18next
            .use(Backend);
  
        return instance.setup({
            backend: {
                loadPath: './locales/{{lng}}/{{ns}}.json',
            },
            attributes: aliases,
            ns: ['translation', 'errors', 'headings', 'buttons', 'notifications', 'titles'],
            defaultNS: 'translation',
            lng: environment.defaultLocale,
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

    if (PLATFORM.global.localStorage) {
        if (PLATFORM.global.localStorage.getItem('se_access_token')) {
            const username = PLATFORM.global.localStorage.getItem('username');
            const accessToken = PLATFORM.global.localStorage.getItem('se_access_token');
            const refreshToken = PLATFORM.global.localStorage.getItem('se_refresh_token');

            await dispatchify(login)({
                username,
                accessToken,
                refreshToken
            });
        }
    }

    await aurelia.setRoot(PLATFORM.moduleName('app'));
}
