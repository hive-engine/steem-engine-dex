import { ArrayFilterValueConverter } from './../../../src/resources/value-converters/array-filter';

describe('Array Filter', () => {
    let sut: ArrayFilterValueConverter;

    beforeEach(() => {
        sut = new ArrayFilterValueConverter();
    })

    test('invalid value should return passed value', () => {
        expect(sut.toView(null, { search: '', term: 'yes' })).toBeNull();
    });

    test('filter array based on property name', () => {
        const mockData = [
            { username: 'beggars', blockchain: 'steem' },
            { username: 'aggroed', blockchain: 'steem' },
            { username: 'bait002', blockchain: 'steem' }
        ];

        const result = sut.toView(mockData, { search: 'username', term: 'beggars' });

        expect(result).toEqual([{ username: 'beggars', blockchain: 'steem' }]);
    });

    test('filter array based on property name and case sensitivity', () => {
        const mockData = [
            { username: 'beggars', blockchain: 'steem' },
            { username: 'aggroed', blockchain: 'steem' },
            { username: 'bait002', blockchain: 'steem' }
        ];

        const result = sut.toView(mockData, { search: 'username', term: 'BEGGARS', caseSensitive: true });

        expect(result).toHaveLength(0);
    });

    test('filter array with empty term value', () => {
        const mockData = [
            { username: 'beggars', blockchain: 'steem' },
            { username: 'aggroed', blockchain: 'steem' },
            { username: 'bait002', blockchain: 'steem' }
        ];

        const result = sut.toView(mockData, { search: 'username', term: '' });

        expect(result).toHaveLength(0);
    });

    test('filter array and sort array with no provided sort order', () => {
        const mockData = [
            { username: 'beggars', blockchain: 'steem' },
            { username: 'aggroed', blockchain: 'steem' },
            { username: 'bait002', blockchain: 'steem' }
        ];

        const result = sut.toView(mockData, { search: 'blockchain', term: 'steem', sort: { key: 'username' } });

        expect(result[0].username).toBe('aggroed');
    });

    test('filter array and sort array and descending sort order', () => {
        const mockData = [
            { username: 'beggars', blockchain: 'steem' },
            { username: 'aggroed', blockchain: 'steem' },
            { username: 'bait002', blockchain: 'steem' }
        ];

        const result = sut.toView(mockData, { search: 'blockchain', term: 'steem', sort: { key: 'username', direction: 'desc' } });

        expect(result[1].username).toBe('bait002');
    });

});
