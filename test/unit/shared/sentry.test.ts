import * as Sentry from '@sentry/node';
import { Logger } from 'loglevel';
import { initSentry } from '../../../api/shared/sentry';
import { Config } from '../../../api/shared/config';

test('init sentry instance', () => {
  const init = jest.fn();
  const sentry: Partial<typeof Sentry> = {
    init,
  };
  const config: Partial<Config> = {
    sentryDSN: 'https://123@sentry.io/456',
  };
  const logger: Partial<Logger> = {
    error: jest.fn(),
  };
  initSentry(sentry as typeof Sentry, config as Config, logger as Logger);
  expect(init).toHaveBeenCalledWith({ dsn: 'https://123@sentry.io/456' });
});
