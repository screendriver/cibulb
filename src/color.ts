import { Handler } from 'aws-lambda';

export const handler: Handler = async event => {
  console.log('request:', JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `Color ole ole ${event.path}\n`,
  };
};
