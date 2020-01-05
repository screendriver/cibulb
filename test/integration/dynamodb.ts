import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import pPipe from 'p-pipe';

interface CreatePipeArgument {
  dynamoDb: DynamoDB;
  tableName: string;
}

function createDynamoDbService() {
  return new DynamoDB({
    endpoint: 'http://localhost:4569',
  });
}

async function createDynamoDbTable(pipeArgument: CreatePipeArgument) {
  const { dynamoDb, tableName } = pipeArgument;
  await dynamoDb
    .createTable({
      TableName: tableName,
      KeySchema: [{ AttributeName: 'Name', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'Name', AttributeType: 'S' }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    })
    .promise();
  return pipeArgument;
}

function fillDynamoDbTable(pipeArgument: CreatePipeArgument) {
  const docClient = new DocumentClient({
    endpoint: pipeArgument.dynamoDb.endpoint.href,
  });
  return docClient
    .put({
      TableName: pipeArgument.tableName,
      Item: { Name: 'my-repository', Status: 'success' },
    })
    .promise();
}

export async function createDynamoDb(tableName: string) {
  const dynamoDb = createDynamoDbService();
  await pPipe(createDynamoDbTable, fillDynamoDbTable)({ dynamoDb, tableName });
}

export async function deleteDynamoDb(tableName: string) {
  const dynamoDb = createDynamoDbService();
  await dynamoDb.deleteTable({ TableName: tableName }).promise();
}
