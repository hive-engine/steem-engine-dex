import { Store, StoreOptions, StateHistory } from 'aurelia-store';
import { Aurelia, PLATFORM } from 'aurelia-framework';
import { Backend, TCustomAttribute } from 'aurelia-i18n';
import { ComponentTester, StageComponent } from 'aurelia-testing';

export function stageComponent(view: string, resources: string[] = [], viewModel = {}) {
    let component: ComponentTester;
  
    component = StageComponent.withResources(resources)
      .boundTo(viewModel)
      .inView(view);
  
    // @ts-ignore
    component.bootstrap((aurelia: Aurelia) => {
      aurelia.use.standardConfiguration();
      aurelia.use.plugin(PLATFORM.moduleName('aurelia-i18n'), (instance) => {
        const aliases = ['t', 'i18n'];
  
        TCustomAttribute.configureAliases(aliases);
  
        // register backend plugin
        instance.i18next.use(Backend.with(aurelia.loader));
        const config = {
            resources: {
                en: {
                    translation: {
                        hello: undefined,
                    },
                },
            },
            skipTranslationOnMissingKey: true,
        };
  
        return instance.setup({
            attributes: aliases,
            backend: {
                loadPath: './locales/{{lng}}/{{ns}}.json',
            },
            debug: false,
            defaultNS: 'translation',
            fallbackLng: 'en',
            interpolation: {
                prefix: '{{',
                suffix: '}}',
            },
            lng: 'en', ...config});
    });
  
      aurelia.container.registerInstance(Element, document.createElement('div'));
    });
  
    return component;
  }

export function createStore<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true } } : {};
  return new Store<T>(state, options);
}

export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  return new Store<T>(state, options);
}

export function createUndoableTestStore(state: StateHistory<any>) {
  const options = { history: { undoable: true } };
  const store = new Store(state, options);

  return { state, store };
}

export async function asyncTimer(msec) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, msec);
  });
}
