import sinon from 'sinon';
import * as Sentry from '@sentry/node';
import { Logger } from 'loglevel';
import { initSentry } from '../../../api/shared/sentry';
import { Config } from '../../../api/shared/config';

describe('sentry', () => {
  it('init sentry instance', () => {
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
