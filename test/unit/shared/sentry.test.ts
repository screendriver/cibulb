import test from 'tape';
import Sentry from '@sentry/node';
import sinon from 'sinon';
import { initSentry } from '../../../src/shared/sentry';
import { Config } from '../../../src/shared/config';

test('init sentry instance', t => {
  t.plan(1);
  const init = sinon.stub();
  const sentry: Partial<typeof Sentry> = {
    init,
  };
  const config: Partial<Config> = {
    sentryDSN: 'https://123@sentry.io/456',
  };
  initSentry(sentry as typeof Sentry, config as Config);
  t.true(init.calledWith({ dsn: 'https://123@sentry.io/456' }));
});
