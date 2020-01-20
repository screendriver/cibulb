import { APIGatewayProxyHandler } from 'aws-lambda';
import SQS from 'aws-sdk/clients/sqs';
import { getEndpoint } from '../endpoint';

export const handler: APIGatewayProxyHandler = async () => {
  const queueUrl = process.env.QUEUE_URL ?? '';
  const sqs = new SQS({ endpoint: getEndpoint(4576) });
  await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageBody: '',
    })
    .promise();
  return {
    statusCode: 200,
    body: '',
  };
};
