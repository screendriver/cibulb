import test from 'tape';
import * as Sentry from '@sentry/node';
import { Logger } from 'loglevel';
import sinon from 'sinon';
import { initSentry } from '../../../api/shared/sentry';
import { Config } from '../../../api/shared/config';

test('init sentry instance', t => {
  t.plan(1);
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
