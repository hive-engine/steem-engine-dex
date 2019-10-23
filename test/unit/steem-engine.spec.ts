jest.mock('sscjs');
jest.mock('steem');

import { request, loadTokenMarketHistory } from 'common/steem-engine';

describe('Functions', () => {

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('request should make a request with a version value on the end of the url', async () => {
        const url = 'testEndpoint';
        const paramsObject: any = {};

        await request(url, paramsObject);

        expect(paramsObject.v).not.toBeUndefined();
    });

    it('loadTokenMarketHistory should return history for token', async () => {
        const symbol = 'ENG';

        const resultData = [{"_id":"5dace26d3415dd328fef94dd","timestamp":1555286400,"symbol":"ENG","volumeSteem":"987.53000000","volumeToken":"1156.1946","lowestPrice":"0.81599681","highestPrice":"0.94927172","openPrice":"0.83000000","closePrice":"0.92700000"},{"_id":"5dace24a3415dd328fef8ded","timestamp":1555200000,"symbol":"ENG","volumeSteem":"582.23100000","volumeToken":"675.1977","lowestPrice":"0.82100000","highestPrice":"0.92000296","openPrice":"0.90001347","closePrice":"0.82100000"},{"_id":"5dace22b3415dd328fef87d9","timestamp":1555113600,"symbol":"ENG","volumeSteem":"397.11400000","volumeToken":"423.04","lowestPrice":"0.90000000","highestPrice":"0.95006803","openPrice":"0.93775934","closePrice":"0.90000000"}];

        fetchMock.mockResponseOnce(JSON.stringify(resultData));

        const response = await loadTokenMarketHistory(symbol);

        expect(response).toMatchObject(resultData);
    });

    it('loadTokenMarketHistory should append timestampStart to url', async () => {
        const symbol = 'ENG';

        fetchMock.mockResponseOnce(JSON.stringify({}));

        const response = await loadTokenMarketHistory(symbol, '123456');
        
        const symbols = Object.getOwnPropertySymbols(fetchMock.mock.calls[0][0]);
        const request = fetchMock.mock.calls[0][0][symbols[1]];

        expect(request.parsedURL).toMatchObject({path: `/history/marketHistory?symbol=${symbol}&timestampStart=123456`});
    });

    it('loadTokenMarketHistory should append timestampEnd to url', async () => {
        const symbol = 'ENG';

        fetchMock.mockResponseOnce(JSON.stringify({}));

        const response = await loadTokenMarketHistory(symbol, null, '123456');
        
        const symbols = Object.getOwnPropertySymbols(fetchMock.mock.calls[0][0]);
        const request = fetchMock.mock.calls[0][0][symbols[1]];

        expect(request.parsedURL).toMatchObject({path: `/history/marketHistory?symbol=${symbol}&timestampEnd=123456`});
    });

});
