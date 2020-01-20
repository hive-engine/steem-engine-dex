import { Keys } from 'resources/value-converters/keys';

describe('Keys', () => {
    let sut: Keys;

    beforeEach(() => {
        sut = new Keys();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('filters out __observers__ from array', () => {
        expect(sut.toView({ key1: true, key2: true, '__observers__': false })).toStrictEqual(['key1', 'key2']);
    });

});
