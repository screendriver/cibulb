import { assert } from 'chai';
import { ItemList } from 'aws-sdk/clients/dynamodb';
import {
  getRepositoriesStatus,
  RepositoriesStatus,
} from '../../src/repositories';

suite('repositories', function() {
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

  test('getRepositoriesStatus() returns "success" when one repository is in status "skipped"', function() {
    const itemList: ItemList = [
      { Status: { S: 'success' } },
      { Status: { S: 'skipped' } },
    ];
    const actual = getRepositoriesStatus(itemList);
    const expected: RepositoriesStatus = 'success';
    assert.equal(actual, expected);
  });
});
