import { Handler } from 'aws-lambda';
import SNS from 'aws-sdk/clients/sns';

export const handler: Handler = async () => {
  await new SNS()
    .publish({ TopicArn: process.env.TOPIC_ARN!, Message: 'success' })
    .promise();
  return {
    statusCode: 200,
    body: 'Hello World!',
  };
};
