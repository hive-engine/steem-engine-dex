/* eslint-disable no-undef */
import { ServerDate } from 'resources/value-converters/server-date';

describe('Server Date', () => {
    let sut: ServerDate;

    beforeEach(() => {
        sut = new ServerDate();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('parses timestamp as utc string', () => {
        expect(sut.toView('1573557933')).toStrictEqual('Tue, 12 Nov 2019 11:25:33 GMT');
    });

    test('return passed in value if it cannot be parsed as a integer', () => {
        expect(sut.toView('fsdfsdf')).toStrictEqual('fsdfsdf');
    });

});
