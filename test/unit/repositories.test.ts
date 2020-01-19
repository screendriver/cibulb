import { assert } from 'chai';
import { ItemList, DocumentClient } from 'aws-sdk/clients/dynamodb';
import { define } from 'cooky-cutter';
import sinon from 'sinon';
import {
  getRepositoriesStatus,
  RepositoriesStatus,
  scanRepositories,
} from '../../src/repositories';

const docClient = define<DocumentClient>({
  batchGet: sinon.fake(),
  batchWrite: sinon.fake(),
  createSet: sinon.fake(),
  delete: sinon.fake(),
  get: sinon.fake(),
  put: sinon.fake(),
  query: sinon.fake(),
  scan: sinon.fake.returns({ promise: sinon.fake.resolves({}) }),
  transactGet: sinon.fake(),
  transactWrite: sinon.fake(),
  update: sinon.fake(),
});

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

  test('scanRepositories() only scans "Status" attribute', async function() {
    const scanOutput = { Items: [] };
    const promise = sinon.fake.resolves(scanOutput);
    const scan = sinon.fake.returns({ promise });
    const generatedDocClient = docClient({
      scan: () => scan,
    });
    await scanRepositories(generatedDocClient)('TestTable');
    sinon.assert.calledWith(scan, {
      TableName: 'TestTable',
      ProjectionExpression: 'Status',
    });
  });

  test('scanRepositories() only returns items', async function() {
    const scanOutput = { Items: [] };
    const promise = sinon.fake.resolves(scanOutput);
    const scan = sinon.fake.returns({ promise });
    const generatedDocClient = docClient({
      scan: () => scan,
    });
    const actual = await scanRepositories(generatedDocClient)('TestTable');
    const expected = scanOutput.Items;
    assert.strictEqual(actual, expected);
  });
});
