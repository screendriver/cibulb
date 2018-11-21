import {
  APIGatewayProxyEvent,
  APIGatewayEventRequestContext,
  Callback,
} from 'aws-lambda';
import { init, captureException } from '@sentry/node';
import got from 'got';
import { getConfig } from './config';

const config = getConfig();
init({ dsn: config.sentryDsn });

export async function handler(
  event: APIGatewayProxyEvent,
  _context: APIGatewayEventRequestContext,
  callback: Callback,
) {
  try {
    console.log(event);
    const { statusCode } = await got.post('https://cibulb-service.now.sh', {
      headers: event.headers,
      body: event.body || '',
      timeout: 10000,
    });
    return callback(null, { statusCode });
  } catch (e) {
    captureException(e);
    return callback(e);
  }
}
