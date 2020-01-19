import { assert } from 'chai';
import SNS from 'aws-sdk/clients/sns';
import sinon from 'sinon';
import { Logger } from 'pino';
import { logOverallStatus, publishSnsTopic } from '../../../src/lambda/refresh';
import { RepositoriesStatus } from '../../../src/repositories';

suite('refresh lambda', function() {
  test('logOverallStatus() returns given overall status', function() {
    const logger = {
      info: sinon.fake(),
    };
    const actual = logOverallStatus((logger as unknown) as Logger)('success');
    const expected: RepositoriesStatus = 'success';
    assert.strictEqual(actual, expected);
  });

  test('logOverallStatus() logs given overall status', function() {
    const logger = {
      info: sinon.fake(),
    };
    logOverallStatus((logger as unknown) as Logger)('success');
    sinon.assert.calledWithExactly(
      logger.info,
      'Overall repositories status:',
      'success',
    );
  });

  test('publishSnsTopic() publishes given overall status', async function() {
    const sns = {
      publish: sinon.fake.returns({
        promise: sinon.fake.resolves(undefined),
      }),
    };
    const topicArn = 'test';
    await publishSnsTopic((sns as unknown) as SNS, topicArn)('success');
    sinon.assert.calledWithExactly(sns.publish, {
      TopicArn: topicArn,
      Message: 'success',
    });
  });
});
