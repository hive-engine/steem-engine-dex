/* eslint-disable no-empty-pattern */
/* eslint-disable no-undef */
import { AuthService } from './../../src/services/auth-service';
import { I18N } from 'aurelia-i18n';
import { HttpClient } from 'aurelia-fetch-client';
import { Container } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

jest.mock('sscjs');
jest.mock('steem');

describe('Steem Engine Service', () => {
    let sut: SteemEngine;
    const mockHttp = () => Container.instance.get(HttpClient);
    const mockI18n = Container.instance.get(I18N);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockToast: any = {};
    const mockAuth = Container.instance.get(AuthService);

    beforeEach(() => {
        fetchMock.resetMocks();
        jest.clearAllMocks();

        sut = new SteemEngine(mockHttp, mockI18n, mockToast, mockAuth);

        (window as any).steem_keychain = {
            requestCustomJson: jest
                .fn()
                .mockImplementation((username, jsonId, keyType, jsonData, displayName, callback) => {
                    callback(jsonData);
                }),
            requestTransfer: jest.fn().mockImplementation((username, account, amount, memo, currency, callback) => {
                callback(account);
            }),
            requestVerifyKey: jest.fn().mockImplementation((username, memo, type, callback) => {
                callback(username);
            }),
        };
    });

    it('should create defaults', () => {
        expect(sut.http).toBe(mockHttp());
        expect(sut.ssc).not.toBeNull();
    });

    it('getUser returns null', () => {
        (global as any).localStorage.removeItem('username');
        sut.user = null;

        const user = sut.getUser();

        expect(user).toBeNull();
    });

    it('getUser returns class user object name if not empty', () => {
        sut.user.name = 'beggars';

        const user = sut.getUser();

        expect(user).toBe('beggars');
    });

    it('loadParams makes required SSC calls', async () => {
        sut.ssc.findOne.mockImplementation((table: string, name: string, {}, callback: any) => {
            {
                callback(undefined, { param: 'beggars', param2: 'aggroed' });
            }
        });

        await sut.loadParams();

        expect(sut.ssc.findOne).toHaveBeenCalledTimes(2);
        expect(sut.params).toEqual({ param: 'beggars', param2: 'aggroed' });
    });
});
