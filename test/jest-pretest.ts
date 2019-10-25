import { GlobalWithFetchMock } from 'jest-fetch-mock';
 
const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;

(global as any).Blob = jest.fn();

import 'aurelia-polyfills';
import { Options } from 'aurelia-loader-nodejs';
import { globalize } from 'aurelia-pal-nodejs';
import * as path from 'path';
import { Container } from 'aurelia-framework';
Options.relativeToDir = path.join(__dirname, 'unit');
globalize();

const container = new Container();
container.makeGlobal();
