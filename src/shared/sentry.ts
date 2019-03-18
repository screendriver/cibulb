import Sentry from '@sentry/node';
import { Config } from './config';

export function initSentry(sentry: typeof Sentry, { sentryDSN }: Config) {
  sentry.init({
    dsn: sentryDSN,
  });
}
