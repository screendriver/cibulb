import sinon from 'sinon';
import * as Sentry from '@sentry/node';
import { Logger } from 'loglevel';
import { initSentry } from '../../../api/_shared/sentry';
import { Config } from '../../../api/_shared/config';

suite('sentry', function() {
  test('init sentry instance', function() {
    const init = sinon.fake();
    const sentry: Partial<typeof Sentry> = {
      init,
    };
    const config: Partial<Config> = {
      sentryDSN: 'https://123@sentry.io/456',
    };
    const logger: Partial<Logger> = {
      error: sinon.fake(),
    };
    initSentry(sentry as typeof Sentry, config as Config, logger as Logger);
    sinon.assert.calledWith(init, { dsn: 'https://123@sentry.io/456' });
  });
});
