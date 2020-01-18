import { APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient, ItemList } from 'aws-sdk/clients/dynamodb';
import SNS from 'aws-sdk/clients/sns';
import pPipe from 'p-pipe';
import pino, { Logger } from 'pino';
import { getEndpoint } from '../endpoint';
import { RepositoriesStatus } from '../repositories';

function scanRepositories(docClient: DocumentClient) {
  return async (tableName: string) => {
    const scanOutput = await docClient.scan({ TableName: tableName }).promise();
    return scanOutput.Items;
  };
}

function checkFailedStatus(itemList: ItemList): RepositoriesStatus {
  return itemList.some(({ Status }) => Status.S === 'failed')
    ? 'failed'
    : 'success';
}

function getStatusForNonEmptyRepos(itemList: ItemList): RepositoriesStatus {
  return itemList.some(
    ({ Status }) => Status.S === 'pending' || Status.S === 'running',
  )
    ? 'pending'
    : checkFailedStatus(itemList);
}

function isEmpty(itemList: ItemList): boolean {
  return itemList.length === 0;
}

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

export function getRepositoriesStatus(itemList?: ItemList): RepositoriesStatus {
  return !itemList || isEmpty(itemList)
    ? 'success'
    : getStatusForNonEmptyRepos(itemList);
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
