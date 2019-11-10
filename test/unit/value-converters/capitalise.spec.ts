import { Capitalise } from './../../../src/resources/value-converters/capitalise';

describe('Capitalise Filter', () => {
    let sut: Capitalise;

    beforeEach(() => {
        sut = new Capitalise();
    })

    test('invalid value should return passed value', () => {
        expect(sut.toView(null)).toBeNull();
    });

    test('number passed instead of string should return empty string', () => {
        expect(sut.toView(1234 as unknown as string)).toBe('');
    });

    test('should capitalise only first letter', () => {
        expect(sut.toView('beggars')).toBe('Beggars');
    });

    test('should capitalise only first letter of multi word value', () => {
        expect(sut.toView('beggars is here')).toBe('Beggars is here');
    });

});
