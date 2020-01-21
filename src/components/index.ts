import { PLATFORM } from 'aurelia-pal';
import { FrameworkConfiguration } from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
    config.globalResources([
        PLATFORM.moduleName('./chart/chart'),
        PLATFORM.moduleName('./countries/countries'),
        PLATFORM.moduleName('./loader/loader'),
        PLATFORM.moduleName('./nav-bar/nav-bar'),
        PLATFORM.moduleName('./select2/select2'),
        PLATFORM.moduleName('./tooltip/tooltip'),
        PLATFORM.moduleName('./errors')
    ]);
}
