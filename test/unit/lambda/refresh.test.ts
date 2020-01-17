import { assert } from 'chai';
import { ItemList } from 'aws-sdk/clients/dynamodb';
import SNS from 'aws-sdk/clients/sns';
import sinon from 'sinon';
import { Logger } from 'pino';
import {
  getRepositoriesStatus,
  RepositoriesStatus,
  logOverallStatus,
  publishSnsTopic,
} from '../../../src/lambda/refresh';

suite('refresh lambda', function() {
  test('getRepositoriesStatus() returns "success" when item list is undefined', function() {
    const actual = getRepositoriesStatus();
    const expected: RepositoriesStatus = 'success';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "success" when item list is empty', function() {
    const itemList: ItemList = [];
    const actual = getRepositoriesStatus(itemList);
    const expected: RepositoriesStatus = 'success';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "pending" when one item is in status "pending"', function() {
    const itemList: ItemList = [
      { Status: { S: 'failed' } },
      { Status: { S: 'pending' } },
      { Status: { S: 'success' } },
    ];
    const actual = getRepositoriesStatus(itemList);
    const expected: RepositoriesStatus = 'pending';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "pending" when one item is in status "running"', function() {
    const itemList: ItemList = [
      { Status: { S: 'failed' } },
      { Status: { S: 'running' } },
      { Status: { S: 'success' } },
    ];
    const actual = getRepositoriesStatus(itemList);
    const expected: RepositoriesStatus = 'pending';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "failed" when one item is in status "failed"', function() {
    const itemList: ItemList = [
      { Status: { S: 'success' } },
      { Status: { S: 'failed' } },
    ];
    const actual = getRepositoriesStatus(itemList);
    const expected: RepositoriesStatus = 'failed';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "success" when all item are in status "success"', function() {
    const itemList: ItemList = [
      { Status: { S: 'success' } },
      { Status: { S: 'success' } },
    ];
    const actual = getRepositoriesStatus(itemList);
    const expected: RepositoriesStatus = 'success';
    assert.strictEqual(actual, expected);
  });

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
