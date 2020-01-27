import { APIGatewayProxyHandler } from 'aws-lambda';
import SQS from 'aws-sdk/clients/sqs';
import { readRequestTracing } from '../headers';
import { getEndpoint } from '../endpoint';

export const handler: APIGatewayProxyHandler = async event => {
  const queueUrl = process.env.QUEUE_URL ?? '';
  const { headers } = event;
  const sqs = new SQS({ endpoint: getEndpoint(4576) });
  await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageGroupId: 'IftttMessageGroup',
      MessageBody: `Call IFTTT - ${readRequestTracing(headers)}`,
    })
    .promise();
  return {
    statusCode: 200,
    body: '',
  };
};
