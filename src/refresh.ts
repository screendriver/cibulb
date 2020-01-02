import { APIGatewayProxyHandler } from 'aws-lambda';
import { DocumentClient, ItemList } from 'aws-sdk/clients/dynamodb';
import SNS from 'aws-sdk/clients/sns';
import pino from 'pino';

export type RepositoriesStatus = 'success' | 'pending' | 'failed';

async function scanRepositories(tableName: string) {
  const docClient = new DocumentClient();
  const scanOutput = await docClient.scan({ TableName: tableName }).promise();
  return scanOutput.Items;
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

export function getRepositoriesStatus(itemList?: ItemList): RepositoriesStatus {
  return !itemList || isEmpty(itemList)
    ? 'success'
    : getStatusForNonEmptyRepos(itemList);
}

export const handler: APIGatewayProxyHandler = async () => {
  const logger = pino();
  const tableName = process.env.DYNAMO_DB_TABLE_NAME ?? '';
  const repositories = await scanRepositories(tableName);
  const overallStatus = getRepositoriesStatus(repositories);
  logger.info('Overall repositories status:', overallStatus);
  await new SNS()
    .publish({ TopicArn: process.env.TOPIC_ARN!, Message: overallStatus })
    .promise();
  return {
    statusCode: 200,
    body: '',
  };
};
