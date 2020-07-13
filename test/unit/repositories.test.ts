import { assert } from 'chai';
import {
  getRepositoriesStatus,
  RepositoryStatus,
  RepositoriesStatus,
} from '../../src/repositories';

suite('repositories', function () {
  test('getRepositoriesStatus() returns "success" when status list is empty', function () {
    const actual = getRepositoriesStatus([]);
    const expected: RepositoriesStatus = 'success';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "success" when status list is filled with null values', function () {
    const actual = getRepositoriesStatus([null, null, null]);
    const expected: RepositoriesStatus = 'success';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "pending" when one item is in status "pending"', function () {
    const statusList: RepositoryStatus[] = ['failed', 'pending', 'success'];
    const actual = getRepositoriesStatus(statusList);
    const expected: RepositoriesStatus = 'pending';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "pending" when one item is in status "running"', function () {
    const statusList: RepositoryStatus[] = ['failed', 'running', 'success'];
    const actual = getRepositoriesStatus(statusList);
    const expected: RepositoriesStatus = 'pending';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "failed" when one item is in status "failed"', function () {
    const statusList: RepositoryStatus[] = ['success', 'failed'];
    const actual = getRepositoriesStatus(statusList);
    const expected: RepositoriesStatus = 'failed';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "success" when all item are in status "success"', function () {
    const statusList: RepositoryStatus[] = ['success', 'success'];
    const actual = getRepositoriesStatus(statusList);
    const expected: RepositoriesStatus = 'success';
    assert.strictEqual(actual, expected);
  });

  test('getRepositoriesStatus() returns "success" when one repository is in status "skipped"', function () {
    const statusList: RepositoryStatus[] = ['success', 'skipped'];
    const actual = getRepositoriesStatus(statusList);
    const expected: RepositoriesStatus = 'success';
    assert.equal(actual, expected);
  });
});
