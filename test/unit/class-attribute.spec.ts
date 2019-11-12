/* eslint-disable no-undef */
import { Aurelia } from 'aurelia-framework';
import { bootstrap } from 'aurelia-bootstrapper';
import { StageComponent, ComponentTester } from 'aurelia-testing';
import { PLATFORM } from 'aurelia-pal';

describe('Stage "class-attribute"', () => {
    let component: ComponentTester;
    const styles = {
        'my-class': Math.random()
    };

    beforeEach(async () => {
        component = StageComponent
            .withResources([
                PLATFORM.moduleName('resources/attributes/class')
            ])
            .boundTo({
                styles
            })
            .inView(`<div class="my-class"></div>`);

        // @ts-ignore
        component.bootstrap((aurelia: Aurelia) => {
            aurelia.use.standardConfiguration();

            aurelia.container.registerInstance(Element, '<div class="my-class">');
        });
    });

    afterEach(() => {
        jest.resetAllMocks();
        fetchMock.resetMocks();
    });

    it('should render and replace the class on the element', async () => {
        await component.create(bootstrap);

        expect(component.element.classList.contains(styles['my-class'].toString())).toBeTruthy();
        expect(component.element.classList.contains('my-class')).toBeFalsy();

        component.dispose();
    });
});
