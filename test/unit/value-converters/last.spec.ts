/* eslint-disable no-undef */
import { LastValueConverter } from 'resources/value-converters/last';

describe('Last', () => {
    let sut: LastValueConverter;

    beforeEach(() => {
        sut = new LastValueConverter();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('returns last item from passed array', () => {
        expect(sut.toView([1, 2, 3, 'apple'])).toStrictEqual(['apple']);
    });

    test('returns passed in value if not an array', () => {
        expect(sut.toView(null)).toBeNull();
    });

    test('returns passed in array if empty', () => {
        expect(sut.toView([])).toStrictEqual([]);
    });

});
