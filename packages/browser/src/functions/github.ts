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
    const options: got.GotBodyOptions<null> = {
      headers: event.headers,
      body: event.body || '',
      timeout: 10000,
    };
    const firebase = got.post(`${config.firebaseFunctionsUrl}/github`, options);
    const now = got.post('https://cibulb-service.now.sh', options);
    const [, { statusCode }] = await Promise.all([firebase, now]);
    return callback(null, { statusCode });
  } catch (e) {
    captureException(e);
    return callback(e);
  }
}
