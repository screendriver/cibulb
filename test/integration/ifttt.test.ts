import { assert } from 'chai';
import AWS, { Credentials, Lambda } from 'aws-sdk';
import micro from 'micro';
import listen from 'test-listen';
import { createDynamoDb, deleteDynamoDb } from './dynamodb';
import { createFunction, deleteFunction } from './lambda';

function getHost() {
  return process.env.HOST ?? 'host.docker.internal';
}

const tableName = 'TestTable';
const functionName = 'ifttt';

suite('ifttt', function() {
  suiteSetup(async function() {
    AWS.config.update({
      credentials: new Credentials('myAccessKeyId', 'mySecretAccessKey'),
      region: 'eu-central-1',
    });
    await createDynamoDb(tableName);
  });

  suiteTeardown(async function() {
    await deleteDynamoDb(tableName);
    await deleteFunction(functionName);
  });

  test('calls IFTTT trigger with data from AWS DynamoDB', async function() {
    this.timeout(20000);
    let iftttRequestUrl: string | undefined;
    const server = micro(req => {
      iftttRequestUrl = req.url;
      return '';
    });
    const url = await listen(server, getHost());
    await createFunction(functionName, {
      IFTTT_KEY: 'my-key',
      IFTTT_BASE_URL: url,
      DYNAMODB_TABLE_NAME: tableName,
    });
    const lambda = new Lambda({ endpoint: 'http://localhost:4574' });
    await lambda.invoke({ FunctionName: functionName }).promise();
    server.close();
    const expected = '/trigger/ci_build_success/with/key/my-key';
    assert.strictEqual(iftttRequestUrl, expected);
  });
});
