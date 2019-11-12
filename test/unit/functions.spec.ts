/* eslint-disable no-undef */
import { addCommas, usdFormat, largeNumber, formatSteemAmount, percentageOf, getSteemPrice, queryParam, popupCenter, tryParse } from 'common/functions';

describe('Functions', () => {

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    it('queryParam should create params', () => {
        const returnedValue = queryParam({ val1: 123, 'value-two': 'gsdgsdg', goose: undefined });

        expect(returnedValue).toEqual('val1=123&value-two=gsdgsdg&goose=undefined');
    });

    it('queryParam should create params with array', () => {
        const returnedValue = queryParam({ val1: 123, 'val2': ['aggroed', 'beggars'] });

        expect(returnedValue).toEqual('val1=123&val2%5B%5D=aggroed&val2%5B%5D=beggars');
    });

    it('addCommas method should convert provided value into comma separated value', () => {
        const returnedValue = addCommas('100000');

        expect(returnedValue).toEqual('100,000');
    });

    it('addCommas method should convert provided value into comma separated value and return cents', () => {
        const returnedValue = addCommas('100000', 1);

        expect(returnedValue).toEqual('100,000.00');
    });

    it('addCommas method should convert provided value into comma separated value return cents without being configured', () => {
        const returnedValue = addCommas('100000.67');

        expect(returnedValue).toEqual('100,000.67');
    });

    it('usdFormat returns expected value without decmial limit and greater than $1', () => {
        const returnedValue = usdFormat(986, null, 0.1354);

        expect(returnedValue).toEqual('$133.50');
    });

    it('usdFormat returns expected value with 3 digit decmial limit', () => {
        const returnedValue = usdFormat(986, 3, 0.1354);

        expect(returnedValue).toEqual('$133.504');
    });

    it('usdFormat returns expected value without decmial limit and less than $1, 3 digits', () => {
        const returnedValue = usdFormat(0.7, null, 0.2);

        // Should toFixed value to 3 digits
        expect(returnedValue).toEqual('$0.140');
    });

    it('usdFormat returns expected value without decmial limit and less than $1, 5 digits', () => {
        const returnedValue = usdFormat(0.7, null, 0.1354);

        // Should toFixed value to 3 digits
        expect(returnedValue).toEqual('$0.09478');
    });

    it('largeNumber returns formatted trillion', () => {
        const returnedValue = largeNumber(1000000000000);

        expect(returnedValue).toEqual('1 T');
    });

    it('largeNumber returns formatted billion', () => {
        const returnedValue = largeNumber(1000000000);

        expect(returnedValue).toEqual('1 B');
    });

    it('largeNumber returns formatted million', () => {
        const returnedValue = largeNumber(1000000);

        expect(returnedValue).toEqual('1 M');
    });

    it('largeNumber returns formatted value without identifier', () => {
        const returnedValue = largeNumber(5000);

        expect(returnedValue).toEqual('5,000');
    });

    it('should format steem amount', () => {
        const returnedValue = formatSteemAmount(257.135678);

        expect(returnedValue).toEqual('257.136');
    });

    it('invalid amount passed to formatSteemAmount', () => {
        const returnedValue = formatSteemAmount(undefined);

        expect(returnedValue).toBeNull();
    });

    it('percentageOf should calculate percentage whole', () => {
        const returnedValue = percentageOf(100, 50);

        expect(returnedValue).toEqual(50);
    });

    it('percentageOf should calculate percentage fraction', () => {
        const returnedValue = percentageOf(7893, 0.87);

        expect(returnedValue).toEqual(68.6691);
    });

    it('percentageOf should return null when passed invalid value', () => {
        // @ts-ignore
        const returnedValue = percentageOf('fdsd', 0.87);

        expect(returnedValue).toBeNull();
    });

    it('percentageOf should return null when passed invalid percentage', () => {

        // @ts-ignore
        const returnedValue = percentageOf(1234, 'fsdf');

        expect(returnedValue).toBeNull();
    });

    it('getSteemPrice should return mock steem price', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ steem_price: 0.389283 }));

        const response = await getSteemPrice();
        expect(response).toEqual(0.389283)
    });

    it('getSteemPrice should return 0 if request fails', async () => {
        fetchMock.mockRejectOnce(new Error('fake error message'));

        const returnedValue = await getSteemPrice();

        expect(returnedValue).toEqual(0);
    });

    it('popupCenter works with valid values', () => {
        (window as any).open = jest.fn().mockImplementation((url?: string, target?: string, features?: string, replace?: boolean) => {
            return {
                focus: jest.fn()
            }
        });

        const returnedValue = popupCenter('https://steemconnect.com', 'Testing', '100px', '300px');

        expect(returnedValue).toEqual({ focus: expect.any(Function) });
    });

    it('tryParse should parse valid JSON string', () => {
        expect(tryParse('{ "params": "test" }')).toEqual({ "params": "test" });
    });

    it('tryParse should return null for invalid JSON string', () => {
        expect(tryParse('invalid value')).toBeNull();
    });

});
