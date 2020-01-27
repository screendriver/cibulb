import * as Sentry from '@sentry/node';
import { Handler } from 'aws-lambda';

export function init() {
  Sentry.init();
}

export function sentryHandler<T extends Handler>(lambdaHandler: T): Handler {
  return async (event, context, callback) => {
    try {
      return await lambdaHandler(event, context, callback);
    } catch (error) {
      Sentry.captureException(error);
      await Sentry.flush(2000);
      return error;
    }
  };
}
