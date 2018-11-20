import {
  APIGatewayProxyEvent,
  APIGatewayEventRequestContext,
  Callback,
} from 'aws-lambda';
import got from 'got';

export async function handler(
  event: APIGatewayProxyEvent,
  _context: APIGatewayEventRequestContext,
  callback: Callback,
) {
  console.log(event);
  const { statusCode } = await got.post('https://cibulb-service.now.sh', {
    headers: event.headers,
    body: event.body || '',
    timeout: 45000,
  });
  return callback(null, { statusCode });
}
