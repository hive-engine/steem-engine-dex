import { ArrayFilterValueConverter } from './../../../src/resources/value-converters/array-filter';

describe('Array Filter', () => {
    let sut: ArrayFilterValueConverter;

    beforeEach(() => {
        sut = new ArrayFilterValueConverter();
    })

    test('invalid value should return passed value', () => {
        expect(sut.toView(null, '', '')).toBeNull();
    });

});
