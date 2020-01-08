import { assert } from 'chai';
import AWS, { Credentials, Lambda, SNS } from 'aws-sdk';
import micro, { json } from 'micro';
import listen from 'test-listen';
import { IncomingMessage } from 'http';
import { createFunction, deleteFunction } from './lambda';
import { createDynamoDb, deleteDynamoDb } from './dynamodb';
import { createTopic, deleteTopic } from './sns';

function getHost() {
  return process.env.HOST ?? 'host.docker.internal';
}

async function confirmSubscription(req: IncomingMessage, sns: SNS) {
  const { TopicArn, Token } = (await json(req)) as {
    TopicArn: string;
    Token: string;
  };
  const response = await sns.confirmSubscription({ Token, TopicArn }).promise();
  return response.SubscriptionArn;
}

async function readSnsMessage(req: IncomingMessage) {
  const body = (await json(req)) as { Message: string };
  return body.Message;
}

const functionName = 'refresh';
const tableName = 'Repositories';
const topic = 'IftttTopic';
let topicArn: string;

suite('refresh', function() {
  suiteSetup(async function() {
    AWS.config.update({
      credentials: new Credentials('myAccessKeyId', 'mySecretAccessKey'),
      region: 'eu-central-1',
    });
    topicArn = await createTopic(topic);
    await createFunction(functionName, {
      DYNAMODB_TABLE_NAME: tableName,
      TOPIC_ARN: topicArn,
    });
    await createDynamoDb(tableName);
  });

  suiteTeardown(async function() {
    await deleteTopic(topicArn);
    await deleteFunction(functionName);
    await deleteDynamoDb(tableName);
  });

  test('lambda publishes a "success" SNS message', async function() {
    this.timeout(20000);
    let snsMessage: string | undefined = undefined;
    const lambda = new Lambda({ endpoint: 'http://localhost:4574' });
    const sns = new SNS({ endpoint: 'http://localhost:4575' });
    const server = micro(async req => {
      switch (req.headers['x-amz-sns-message-type']) {
        case 'SubscriptionConfirmation':
          return confirmSubscription(req, sns);
        case 'Notification':
          snsMessage = await readSnsMessage(req);
          return snsMessage;
        default:
          return '';
      }
    });
    const url = await listen(server, getHost());
    await sns
      .subscribe({ Endpoint: url, Protocol: 'http', TopicArn: topicArn })
      .promise();
    await lambda.invoke({ FunctionName: functionName }).promise();
    server.close();
    assert.strictEqual(snsMessage, 'success');
  });
});
