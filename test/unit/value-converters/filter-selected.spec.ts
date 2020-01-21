import { FilterSelectedValueConverter } from 'resources/value-converters/filter-selected';

describe('Filter Selected', () => {
    let sut: FilterSelectedValueConverter;

    beforeEach(() => {
        sut = new FilterSelectedValueConverter();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('invalid value should return passed value', () => {
        expect(sut.toView(null, {})).toBeNull();
    });

    test('filter array based on property name in properties', () => {
        const mockData = [
            'beggars',
            'bait',
            'lion',
            'aggroed'
        ];

        const properties = [
            { name: 'bait' }
        ];

        const result = sut.toView(mockData, properties);

        expect(result).toEqual(['beggars', 'lion', 'aggroed']);
    });
});
