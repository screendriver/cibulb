import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export interface Repository {
  status: 'success' | 'running' | 'skipped' | 'pending' | 'failed';
}

export type RepositoriesStatus = 'success' | 'pending' | 'failed';

function checkFailedStatus(
  itemList: DocumentClient.ItemList,
): RepositoriesStatus {
  return itemList.some(({ RepoStatus }) => RepoStatus === 'failed')
    ? 'failed'
    : 'success';
}

function getStatusForNonEmptyRepos(
  itemList: DocumentClient.ItemList,
): RepositoriesStatus {
  return itemList.some(
    ({ RepoStatus }) => RepoStatus === 'pending' || RepoStatus === 'running',
  )
    ? 'pending'
    : checkFailedStatus(itemList);
}

function isEmpty(itemList: DocumentClient.ItemList): boolean {
  return itemList.length === 0;
}

export function getRepositoriesStatus(
  itemList?: DocumentClient.ItemList,
): RepositoriesStatus {
  return !itemList || isEmpty(itemList)
    ? 'success'
    : getStatusForNonEmptyRepos(itemList);
}

export function scanRepositories(docClient: DocumentClient) {
  return async (tableName: string) => {
    const scanOutput = await docClient
      .scan({ TableName: tableName, ProjectionExpression: 'RepoStatus' })
      .promise();
    return scanOutput.Items;
  };
}
