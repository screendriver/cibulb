import * as Sentry from '@sentry/node';
import { Logger } from 'loglevel';
import { Config } from './config';

export function initSentry(
  sentry: typeof Sentry,
  { sentryDSN }: Config,
  logger: Logger,
) {
  try {
    sentry.init({
      dsn: sentryDSN,
    });
  } catch (e) {
    logger.error('Could not init Sentry', e);
  }
}
