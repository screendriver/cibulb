import {
  APIGatewayProxyEvent,
  APIGatewayEventRequestContext,
  Callback,
} from 'aws-lambda';

export function handler(
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext,
  callback: Callback,
) {
  console.log('event', event);
  console.log('context', context);
  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      data: '⊂◉‿◉つ',
    }),
  });
}
