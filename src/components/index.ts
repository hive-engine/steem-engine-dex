import { PLATFORM } from 'aurelia-pal';
import { FrameworkConfiguration } from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
    config.globalResources([
        PLATFORM.moduleName('./chart/chart'),
        PLATFORM.moduleName('./loader/loader'),
        PLATFORM.moduleName('./nav-bar/nav-bar'),
    ]);
}
