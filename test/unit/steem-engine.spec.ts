/* eslint-disable no-undef */
import * as functions from 'common/steem-engine';
//import { request, loadTokenMarketHistory, checkTransaction } from 'common/steem-engine';

jest.mock('sscjs');
jest.mock('steem');

import { ssc } from 'common/ssc';

describe('Functions', () => {
    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('request should make a request with a version value on the end of the url', async () => {
        const url = 'testEndpoint';
        const paramsObject: any = {};

        await functions.request(url, paramsObject);

        expect(paramsObject.v).not.toBeUndefined();
    });

    test('loadTokenMarketHistory should return history for token', async () => {
        const symbol = 'ENG';

        const resultData = [
            {
                _id: '5dace26d3415dd328fef94dd',
                timestamp: 1555286400,
                symbol: 'ENG',
                volumeSteem: '987.53000000',
                volumeToken: '1156.1946',
                lowestPrice: '0.81599681',
                highestPrice: '0.94927172',
                openPrice: '0.83000000',
                closePrice: '0.92700000',
            },
            {
                _id: '5dace24a3415dd328fef8ded',
                timestamp: 1555200000,
                symbol: 'ENG',
                volumeSteem: '582.23100000',
                volumeToken: '675.1977',
                lowestPrice: '0.82100000',
                highestPrice: '0.92000296',
                openPrice: '0.90001347',
                closePrice: '0.82100000',
            },
            {
                _id: '5dace22b3415dd328fef87d9',
                timestamp: 1555113600,
                symbol: 'ENG',
                volumeSteem: '397.11400000',
                volumeToken: '423.04',
                lowestPrice: '0.90000000',
                highestPrice: '0.95006803',
                openPrice: '0.93775934',
                closePrice: '0.90000000',
            },
        ];

        fetchMock.mockResponseOnce(JSON.stringify(resultData));

        const response = await functions.loadTokenMarketHistory(symbol);

        expect(response).toMatchObject(resultData);
    });

    test('loadTokenMarketHistory should append timestampStart to url', async () => {
        const symbol = 'ENG';

        fetchMock.mockResponseOnce(JSON.stringify({}));

        await functions.loadTokenMarketHistory(symbol, '123456');

        const symbols = Object.getOwnPropertySymbols(fetchMock.mock.calls[0][0]);
        const request = fetchMock.mock.calls[0][0][symbols[1]];

        expect(request.parsedURL).toMatchObject({
            path: `/marketHistory?symbol=${symbol}&timestampStart=123456`,
        });
    });

    test('loadTokenMarketHistory should append timestampEnd to url', async () => {
        const symbol = 'ENG';

        fetchMock.mockResponseOnce(JSON.stringify({}));

        await functions.loadTokenMarketHistory(symbol, null, '123456');

        const symbols = Object.getOwnPropertySymbols(fetchMock.mock.calls[0][0]);
        const request = fetchMock.mock.calls[0][0][symbols[1]];

        expect(request.parsedURL).toMatchObject({
            path: `/marketHistory?symbol=${symbol}&timestampEnd=123456`,
        });
    });

    test('loadAccountHistory should return account for token', async () => {
        const symbol = 'ENG';

        const resultData = [
            {
                _id: '5dace26d3415dd328fef94dd',
                timestamp: 1555286400,
                symbol: 'ENG',
                volumeSteem: '987.53000000',
                volumeToken: '1156.1946',
                lowestPrice: '0.81599681',
                highestPrice: '0.94927172',
                openPrice: '0.83000000',
                closePrice: '0.92700000',
            },
            {
                _id: '5dace24a3415dd328fef8ded',
                timestamp: 1555200000,
                symbol: 'ENG',
                volumeSteem: '582.23100000',
                volumeToken: '675.1977',
                lowestPrice: '0.82100000',
                highestPrice: '0.92000296',
                openPrice: '0.90001347',
                closePrice: '0.82100000',
            },
            {
                _id: '5dace22b3415dd328fef87d9',
                timestamp: 1555113600,
                symbol: 'ENG',
                volumeSteem: '397.11400000',
                volumeToken: '423.04',
                lowestPrice: '0.90000000',
                highestPrice: '0.95006803',
                openPrice: '0.93775934',
                closePrice: '0.90000000',
            },
        ];

        fetchMock.mockResponseOnce(JSON.stringify(resultData));

        const response = await functions.loadAccountHistory(symbol);

        expect(response).toMatchObject(resultData);
    });

    test('loadAccountHistory should append timestampStart to url', async () => {
        const symbol = 'ENG';

        fetchMock.mockResponseOnce(JSON.stringify({}));

        await functions.loadAccountHistory('beggars', symbol, '123456');

        const symbols = Object.getOwnPropertySymbols(fetchMock.mock.calls[0][0]);
        const request = fetchMock.mock.calls[0][0][symbols[1]];

        expect(request.parsedURL).toMatchObject({
            path: `/accountHistory?account=beggars&symbol=${symbol}&timestampStart=123456`,
        });
    });

    test('loadAccountHistory should append timestampEnd to url', async () => {
        const symbol = 'ENG';

        fetchMock.mockResponseOnce(JSON.stringify({}));

        await functions.loadAccountHistory('beggars', symbol, null, '123456');

        const symbols = Object.getOwnPropertySymbols(fetchMock.mock.calls[0][0]);
        const request = fetchMock.mock.calls[0][0][symbols[1]];

        expect(request.parsedURL).toMatchObject({
            path: `/accountHistory?account=beggars&symbol=${symbol}&timestampEnd=123456`,
        });
    });

    test('getTransactionInfo succeeds', async () => {
        const jsonData = JSON.stringify({ "errors": [] });

        jest.spyOn(ssc, 'getTransactionInfo').mockImplementation((txId, callback: any) => {
            callback(null, { logs: jsonData });
        });

        await expect(functions.getTransactionInfo('gdfkjgkdfljg1234')).resolves.toEqual({ logs: jsonData });
    });

    test('parseTokens removes disabled tokens', () => {
        const data = {
            tokens: [
                { symbol: 'PAL', supply: 0, circulatingSupply: 0 },
                { symbol: 'ENG', supply: 0, circulatingSupply: 0 },
                { symbol: 'DISNEY', supply: 0, circulatingSupply: 0 },
                { symbol: 'ASS', supply: 0, circulatingSupply: 0 }
            ]
        };

        const parsed = functions.parseTokens(data);

        // DISNEY should be removed
        expect(parsed).toHaveLength(3);
    });

    test('parseTokens sets steemp supply and circulating supply', () => {
        const data = {
            tokens: [
                { symbol: 'PAL', supply: 0, circulatingSupply: 0 },
                { symbol: 'ENG', supply: 0, circulatingSupply: 0 },
                { symbol: 'DISNEY', supply: 0, circulatingSupply: 0 },
                { symbol: 'ASS', supply: 0, circulatingSupply: 0 },
                { symbol: 'STEEMP', supply: 999, circulatingSupply: 95849485 }
            ],
            steempBalance: {
                balance: 598
            }
        };

        const parsed = functions.parseTokens(data);
        const token = (parsed as any).find(t => t.symbol === 'STEEMP');

        expect(token.supply).toEqual(401);
        expect(token.circulatingSupply).toEqual(95849485 - data.steempBalance.balance);
    });

    test('loadPendingUnstakes succeeds', async () => {
        jest.spyOn(ssc, 'find').mockImplementation(() => {
            return Promise.resolve([1, 2, 3, 4]);
        });

        await expect(functions.loadPendingUnstakes('beggars')).resolves.toEqual([1, 2, 3, 4]);
    });

    test('loadPendingUnstakes fails', async () => {
        jest.spyOn(ssc, 'find').mockImplementation(() => {
            return Promise.reject();
        });

        await expect(functions.loadPendingUnstakes('beggars')).resolves.toEqual([]);
    });

    test('getTransactionInfo fails', async () => {
        const jsonData = JSON.stringify({ "errors": ["some error"] });

        jest.spyOn(ssc, 'getTransactionInfo').mockImplementation((txId, callback: any) => {
            callback(null, { logs: jsonData });
        });

        await expect(functions.getTransactionInfo('gdfkjgkdfljg1234')).resolves.toEqual({ error: 'some error', errors: ['some error'], logs: jsonData });
    });

    test('getTransactionInfo result is empty', async () => {
        jest.spyOn(ssc, 'getTransactionInfo').mockImplementation((txId, callback: any) => {
            callback(null, null);
        });

        await expect(functions.getTransactionInfo('gdfkjgkdfljg1234')).rejects.toBeNull();
    });

    test('checktransaction should only call once', async () => {
        const spy = jest.spyOn(functions, 'getTransactionInfo').mockResolvedValue(true);

        functions.checkTransaction('12345678', 3);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('checktransaction should throw error after exceeding retry count', async () => {
        jest.spyOn(functions, 'getTransactionInfo').mockRejectedValue(true);

        await expect(functions.checkTransaction('12345678', 0)).rejects.toThrowError('Transaction not found.');
    });
});
