import sinon from 'sinon';
import * as Sentry from '@sentry/node';
import { Logger } from 'loglevel';
import { initSentry } from '../../../api/_shared/sentry';
import { Config } from '../../../api/_shared/config';

function callInitSentry(
  sentryInit: typeof Sentry['init'],
  logError: Logger['error'] = sinon.fake(),
) {
  const sentry: Partial<typeof Sentry> = {
    init: sentryInit,
  };
  const config: Partial<Config> = {
    sentryDSN: 'https://123@sentry.io/456',
  };
  const logger: Partial<Logger> = {
    error: logError,
  };
  initSentry(sentry as typeof Sentry, config as Config, logger as Logger);
}

suite('sentry', function() {
  test('init sentry instance', function() {
    const sentryInit = sinon.fake();
    callInitSentry(sentryInit);
    sinon.assert.calledWith(sentryInit, { dsn: 'https://123@sentry.io/456' });
  });

  test('logs an error when initialization fails', function() {
    const init = sinon.fake.throws('Something went wrong');
    const logError = sinon.fake();
    callInitSentry(init, logError);
    sinon.assert.calledWith(logError, 'Could not init Sentry');
  });
});
