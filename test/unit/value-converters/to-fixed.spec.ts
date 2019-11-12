/* eslint-disable no-undef */
import { ToFixedValueConverter } from 'resources/value-converters/to-fixed';

describe('To Fixed', () => {
    let sut: ToFixedValueConverter;

    beforeEach(() => {
        sut = new ToFixedValueConverter();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('parses value and returns to 3 fixed places', () => {
        expect(sut.toView('39.8984398', 3)).toStrictEqual('39.898');
    });

    test('returns passed value because it is not a valid integer', () => {
        expect(sut.toView(null, 3)).toBeNull();
    });

});
