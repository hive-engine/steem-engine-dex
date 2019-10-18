import { addCommas, usdFormat, largeNumber, formatSteemAmount, percentageOf } from 'common/functions';

describe('Functions', () => {

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

});
