import test from 'ava';
import * as Sentry from '@sentry/node';
import { Logger } from 'loglevel';
import sinon from 'sinon';
import { initSentry } from '../../../src/shared/sentry';
import { Config } from '../../../src/shared/config';

test('init sentry instance', t => {
  const init = sinon.stub();
  const sentry: Partial<typeof Sentry> = {
    init,
  };
  const config: Partial<Config> = {
    sentryDSN: 'https://123@sentry.io/456',
  };
  const logger: Partial<Logger> = {
    error: sinon.stub(),
  };
  initSentry(sentry as typeof Sentry, config as Config, logger as Logger);
  t.true(init.calledWith({ dsn: 'https://123@sentry.io/456' }));
});
