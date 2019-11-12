// process.on('unhandledRejection', () => {

// });

import { GlobalWithFetchMock } from 'jest-fetch-mock';
 
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

(global as any).Blob = jest.fn();

(global as any).localStorage = {
    values: [],
    getItem: jest.fn().mockImplementation((key: string) => {
        return (global as any).localStorage.values[key] || null;
    }),
    setItem: jest.fn().mockImplementation((key: string, value: string) => {
        (global as any).localStorage.values[key] = value;
    }),
    removeItem: jest.fn().mockImplementation((key: string) => {
        delete (global as any).localStorage.values[key];
    }),
};

(global as any).navigator = {
    
};

import 'aurelia-polyfills';
import { Options } from 'aurelia-loader-nodejs';
import { globalize } from 'aurelia-pal-nodejs';
import * as path from 'path';
import { Container } from 'aurelia-framework';
Options.relativeToDir = path.join(__dirname, 'unit');
globalize();

const container = new Container();
container.makeGlobal();
