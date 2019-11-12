/* eslint-disable no-undef */
import { RouteConfig } from 'aurelia-router';
import { AuthFilter } from 'resources/value-converters/auth-filter';

describe('Auth Filter', () => {
    let sut: AuthFilter;

    beforeEach(() => {
        sut = new AuthFilter();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    test('user is not logged in, filters out auth roles', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false } },
            { name: 'test2', config: { auth: true } },
            { name: 'test3', config: { auth: true } },
            { name: 'test4', config: { auth: false } }
        ];

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], false, {});

        expect(result).toHaveLength(2);
    });

    test('user is logged in, returns all routes', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false } },
            { name: 'test2', config: { auth: true } },
            { name: 'test3', config: { auth: true } },
            { name: 'test4', config: { auth: false } }
        ];

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], true, {});

        expect(result).toHaveLength(4);
    });

    test('user is logged in, filters publicOnly routes', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false, publicOnly: true } },
            { name: 'test2', config: { auth: true } },
            { name: 'test3', config: { auth: true } },
            { name: 'test4', config: { auth: false, publicOnly: true } }
        ];

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], true, {});

        expect(result).toHaveLength(2);
    });

    test('user is logged in, should not see admin routes', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false, publicOnly: true } },
            { name: 'test2', config: { auth: true }, settings: { roles: ['admin'] } },
            { name: 'test3', config: { auth: true }, settings: { roles: ['super'] } },
            { name: 'test4', config: { auth: true } },
            { name: 'test5', config: { auth: false, publicOnly: true } }
        ];

        const mockClaims = {
            member: true
        };

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], true, mockClaims);

        expect(result).toHaveLength(1);
    });

    test('user is logged in, should see admin routes', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false, publicOnly: true } },
            { name: 'test2', config: { auth: true }, settings: { roles: ['admin'] } },
            { name: 'test3', config: { auth: true }, settings: { roles: ['super'] } },
            { name: 'test4', config: { auth: true } },
            { name: 'test5', config: { auth: false, publicOnly: true } }
        ];

        const mockClaims = {
            member: true,
            admin: true
        };

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], true, mockClaims);

        expect(result).toHaveLength(2);
    });

    test('user is logged in, should see super admin routes', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false, publicOnly: true } },
            { name: 'test2', config: { auth: true }, settings: { roles: ['admin'] } },
            { name: 'test3', config: { auth: true }, settings: { roles: ['super'] } },
            { name: 'test4', config: { auth: true } },
            { name: 'test5', config: { auth: false, publicOnly: true } }
        ];

        const mockClaims = {
            member: true,
            admin: true,
            super: true
        };

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], true, mockClaims);

        expect(result).toHaveLength(3);
    });

    test('user is logged in, route has multiple roles', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false, publicOnly: true } },
            { name: 'test2', config: { auth: true }, settings: { roles: ['admin', 'super'] } },
            { name: 'test3', config: { auth: true }, settings: { roles: ['member'] } },
            { name: 'test4', config: { auth: true } },
            { name: 'test5', config: { auth: false, publicOnly: true } }
        ];

        const mockClaims = {
            member: true,
            admin: true,
            super: false
        };

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], true, mockClaims);

        expect(result).toHaveLength(3);
    });

    test('user is logged in, claims are empty', () => {
        const mockRoutes = [
            { name: 'test', config: { auth: false, publicOnly: true } },
            { name: 'test2', config: { auth: true }, settings: { roles: ['admin', 'super'] } },
            { name: 'test3', config: { auth: true }, settings: { roles: ['member'] } },
            { name: 'test4', config: { auth: true } },
            { name: 'test5', config: { auth: false, publicOnly: true } }
        ];

        const result = sut.toView(mockRoutes as unknown as RouteConfig[], true, {});

        expect(result).toHaveLength(1);
    });

});
