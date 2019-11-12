/* eslint-disable no-undef */
import { AureliaHooks } from 'services/aurelia-hooks'

describe('Aurelia Hooks', () => {
    let sut: AureliaHooks;

    beforeEach(() => {
        sut = new AureliaHooks();
    });

    afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fetchMock.resetMocks();
    });

    describe('Actions', () => {
        it('adds new action with default priority', () => {
            sut.addAction('test', jest.fn());

            const actions = sut.getActions('test');

            expect(actions[0].priority).toEqual(10);
        });

        it('adds new action with priority of 2', () => {
            sut.addAction('test', jest.fn(), 2);

            const actions = sut.getActions('test');

            expect(actions[0].priority).toEqual(2);
        });

        it('has registered action', () => {
            sut.addAction('test', jest.fn(), 2);

            expect(sut.hasAction('test')).toBeTruthy();
        });

        it('does not have registered action', () => {
            expect(sut.hasAction('test')).toBeFalsy();
        });

        it('register single action and call it', () => {
            const callback = jest.fn();

            sut.addAction('testme', callback);

            sut.doAction('testme');

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('register multiple actions and call them', () => {
            const callback = jest.fn();

            sut.addAction('testme', callback);
            sut.addAction('testme', callback);

            sut.doAction('testme');

            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('register multiple actions with custom priorities', async () => {
            const callOrder = [];
            const callback = jest.fn().mockImplementation(() => callOrder.push(1));
            const callback2 = jest.fn().mockImplementation(() => callOrder.push(2));

            sut.addAction('testme', callback);
            sut.addAction('testme', callback2, 1);

            sut.doAction('testme');

            expect(callOrder).toEqual([2, 1]);
        });

        it('removeAction should remove action', () => {
            const callback = jest.fn();

            sut.addAction('testme', callback);
            sut.removeAction('testme', callback);

            sut.doAction('testme');

            expect(callback).not.toHaveBeenCalled();
            expect(sut.hasAction('testme')).toBeFalsy();
        });

        it('removeAction called on non-existent action should set empty array', () => {
            const callback = jest.fn();

            sut.removeAction('testme', callback);

            const actions = sut.getActions('testme');

            expect(Array.isArray(actions)).toBeFalsy();
        });
    });

    describe('Filters', () => {
        it('adds new filter with default priority', () => {
            sut.addFilter('test', jest.fn());

            expect(sut.hasFilter('test')).toBeTruthy();

            const filters = sut.getFilters('test');

            expect(filters[0].priority).toEqual(10);
        });

        it('adds new filter with priority of 2', () => {
            sut.addFilter('test', jest.fn(), 2);

            expect(sut.hasFilter('test')).toBeTruthy();

            const actions = sut.getFilters('test');

            expect(actions[0].priority).toEqual(2);
        });

        it('register single filter and call it', () => {
            const callback = jest.fn();

            sut.addFilter('testme', callback);

            sut.applyFilter('testme', 'test');

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('register multiple filters and call them', () => {
            const callback = jest.fn();

            sut.addFilter('testme', callback);
            sut.addFilter('testme', callback);

            sut.applyFilter('testme', 'testme');

            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('register multiple filters with custom priorities', async () => {
            const callOrder = [];
            const callback = jest.fn().mockImplementation(() => callOrder.push(1));
            const callback2 = jest.fn().mockImplementation(() => callOrder.push(2));

            sut.addFilter('testme', callback);
            sut.addFilter('testme', callback2, 1);

            sut.applyFilter('testme', 'testahhh');

            expect(callOrder).toEqual([2, 1]);
        });

        it('applyfilter should transform value from 1 to 2', () => {
            const callback = jest.fn().mockImplementation((val: number) => {
                return val + 1;
            });

            sut.addFilter('increment', callback);

            const value = sut.applyFilter('increment', 1);

            expect(value).toEqual(2);
        });

        it('applyfilter should transform value from 1 to 3', () => {
            const callback = jest.fn().mockImplementation((val: number) => {
                return val + 1;
            });

            sut.addFilter('increment', callback);
            sut.addFilter('increment', callback);

            const value = sut.applyFilter('increment', 1);

            expect(value).toEqual(3);
        });

        it('applyfilter should return default value if no callback supplied', () => {
            const value = sut.applyFilter('increment', 1);

            expect(value).toEqual(1);
        });

        it('removeFilter should remove filter', () => {
            const callback = jest.fn();

            sut.addFilter('testme', callback);
            sut.removeFilter('testme', callback);

            sut.applyFilter('testme', 'nothing');

            expect(callback).not.toHaveBeenCalled();
        });

        it('removeFilter called on non-existent filter should set empty array', () => {
            const callback = jest.fn();

            sut.removeFilter('testme', callback);

            const filters = sut.getFilters('testme');

            expect(Array.isArray(filters)).toBeFalsy();
        });

    });

});
