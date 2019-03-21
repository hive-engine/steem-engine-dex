import * as cypress from 'cypress';
import * as config from '../../cypress.config';
import { CLIOptions } from 'aurelia-cli';

export default (cb) => {
  if (CLIOptions.hasFlag('run')) {
    cypress
      .run(config)
      .then(results => (results.totalFailed === 0 ? cb() : cb('Run failed!')))
      .catch(cb);
  } else {
    cypress.open(config);
  }
};
