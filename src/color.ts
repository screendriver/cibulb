import { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async event => {
  return Promise.resolve({
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `Color ole ole ${event.path}`,
  });
};
