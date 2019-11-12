/* eslint-disable no-undef */
import { FloatValueConverter } from 'resources/value-converters/float';

describe('Float', () => {
    let sut: FloatValueConverter;

    beforeEach(() => {
        sut = new FloatValueConverter();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('parses float and returns the numeric value', () => {
        expect(sut.toView('1234.897')).toEqual(1234.897);
    });

    test('parses float and 0 if not parseable', () => {
        expect(sut.toView(null)).toEqual(0);
    });

});
