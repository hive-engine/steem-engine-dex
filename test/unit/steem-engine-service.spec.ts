import { AuthService } from './../../src/services/auth-service';
import { ToastService } from './../../src/services/toast-service';
import { I18N } from 'aurelia-i18n';
import { EventAggregator } from 'aurelia-event-aggregator';
import { HttpClient } from 'aurelia-fetch-client';
import { Container } from 'aurelia-framework';
import { SteemEngine } from 'services/steem-engine';

jest.mock('sscjs');
jest.mock('steem');

describe('Steem Engine Service', () => {
    let sut;
    let mockHttp = () => Container.instance.get(HttpClient);
    let mockEa = Container.instance.get(EventAggregator);
    let mockI18n = Container.instance.get(I18N);
    let mockToast: any = {};
    let mockAuth = Container.instance.get(AuthService);

    beforeEach(() => {
        fetchMock.resetMocks();
        jest.clearAllMocks();

        sut = new SteemEngine(mockHttp, mockEa, mockI18n, mockToast, mockAuth);
    });

    it('should create defaults', () => {
        expect(sut.http).toBe(mockHttp());
        expect(sut.ssc).not.toBeNull();
    });

    it ('getUser returns username from localstorage', () => {
        (global as any).localStorage.setItem('username', 'beggars');

        const user = sut.getUser();

        expect(user).toBe('beggars');
    });

    it ('getUser returns null', () => {
        (global as any).localStorage.removeItem('username');
        sut.user = null;

        const user = sut.getUser();

        expect(user).toBeNull();
    });

    it ('getUser returns localstorage value if class user object name is empty', () => {
        (global as any).localStorage.setItem('username', 'beggars');
        sut.user.name = '';

        const user = sut.getUser();

        expect(user).toBe('beggars');
    });

    it ('getUser returns class user object name if not empty', () => {
        sut.user.name = 'beggars';

        const user = sut.getUser();

        expect(user).toBe('beggars');
    });

});
