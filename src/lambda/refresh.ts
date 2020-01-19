import { APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import SNS from 'aws-sdk/clients/sns';
import pPipe from 'p-pipe';
import pino, { Logger } from 'pino';
import { getEndpoint } from '../endpoint';
import {
  RepositoriesStatus,
  getRepositoriesStatus,
  scanRepositories,
} from '../repositories';

export function logOverallStatus(logger: Logger) {
  return (overallStatus: RepositoriesStatus): RepositoriesStatus => {
    logger.info('Overall repositories status:', overallStatus);
    return overallStatus;
  };
}

export function publishSnsTopic(sns: SNS, topicArn: string) {
  return (overallStatus: RepositoriesStatus) => {
    return sns
      .publish({ TopicArn: topicArn, Message: overallStatus })
      .promise();
  };
}

export const handler: APIGatewayProxyHandler = async () => {
  const logger = pino();
  const tableName = process.env.DYNAMODB_TABLE_NAME ?? '';
  const topicArn = process.env.TOPIC_ARN ?? '';
  const docClient = new DocumentClient({ endpoint: getEndpoint(4569) });
  const sns = new SNS({ endpoint: getEndpoint(4575) });
  await pPipe(
    scanRepositories(docClient),
    getRepositoriesStatus,
    logOverallStatus(logger),
    publishSnsTopic(sns, topicArn),
  )(tableName);
  return {
    statusCode: 200,
    body: '',
  };
};
