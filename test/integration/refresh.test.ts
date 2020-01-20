import { assert } from 'chai';
import AWS, { Credentials, Lambda, SQS } from 'aws-sdk';
import { createFunction, deleteFunction } from './lambda';

const functionName = 'refresh';
let sqs: SQS;
let queueUrl: string;

suite('refresh', function() {
  suiteSetup(async function() {
    AWS.config.update({
      credentials: new Credentials('myAccessKeyId', 'mySecretAccessKey'),
      region: 'eu-central-1',
    });
    sqs = new SQS({ endpoint: 'http://localhost:4576' });
    const queue = await sqs.createQueue({ QueueName: 'TestQueue' }).promise();
    queueUrl = queue.QueueUrl ?? '';
    await createFunction(functionName, {
      QUEUE_URL: 'http://172.17.0.1:4576/queue/TestQueue',
    });
  });

  suiteTeardown(async function() {
    await deleteFunction(functionName);
    await sqs.deleteQueue({ QueueUrl: queueUrl }).promise();
  });

  test('lambda sends a SQS message without a message body', async function() {
    this.timeout(20000);
    const lambda = new Lambda({ endpoint: 'http://localhost:4574' });
    await lambda.invoke({ FunctionName: functionName }).promise();
    const message = await sqs
      .receiveMessage({
        QueueUrl: queueUrl,
      })
      .promise();
    const messages = message.Messages ?? [];
    assert.strictEqual(messages[0].Body, '');
  });
});
