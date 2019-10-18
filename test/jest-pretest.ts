(global as any).fetch = require('jest-fetch-mock');

import 'aurelia-polyfills';
import {Options} from 'aurelia-loader-nodejs';
import {globalize} from 'aurelia-pal-nodejs';
import * as path from 'path';
import { Container } from 'aurelia-framework';
Options.relativeToDir = path.join(__dirname, 'unit');
globalize();

const container = new Container();
container.makeGlobal();
