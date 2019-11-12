/* eslint-disable no-undef */
import { SliceValueConverter } from 'resources/value-converters/slice';

describe('Slice', () => {
    let sut: SliceValueConverter;

    beforeEach(() => {
        sut = new SliceValueConverter();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('slices array to two places', () => {
        expect(sut.toView([1, 2, 3, 4, 5, 6], 2)).toStrictEqual([1, 2]);
    });

    test('slices array to two places and reverses it', () => {
        expect(sut.toView([1, 2, 3, 4, 5, 6], 2, true)).toStrictEqual([2, 1]);
    });

    test('slices array with count greater than length of array', () => {
        expect(sut.toView([1, 2, 3, 4, 5, 6], 10)).toStrictEqual([1, 2, 3, 4, 5, 6]);
    });

    test('slices array with count greater than length of array and reverses it', () => {
        expect(sut.toView([1, 2, 3, 4, 5, 6], 10, true)).toStrictEqual([6, 5, 4, 3, 2, 1]);
    });

    test('returns passed value if it is not valid', () => {
        expect(sut.toView(null, 10, true)).toBeNull();
    });

    test('slices array to two places, count value is a string', () => {
        expect(sut.toView([1, 2, 3, 4, 5, 6], '2')).toStrictEqual([1, 2]);
    });

});
