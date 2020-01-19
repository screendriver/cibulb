import { ItemList, DocumentClient } from 'aws-sdk/clients/dynamodb';

export interface Repository {
  status: 'success' | 'running' | 'skipped' | 'pending' | 'failed';
}

export type RepositoriesStatus = 'success' | 'pending' | 'failed';

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

export function scanRepositories(docClient: DocumentClient) {
  return async (tableName: string) => {
    const scanOutput = await docClient
      .scan({ TableName: tableName, ProjectionExpression: 'Status' })
      .promise();
    return scanOutput.Items;
  };
}
