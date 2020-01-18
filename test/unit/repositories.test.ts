import { assert } from 'chai';
import { getRepositoriesStatus, Repository } from '../../src/repositories';

suite('repositories', function() {
  test('returns "success" when repositories are empty', function() {
    const status = getRepositoriesStatus([]);
    assert.equal(status, 'success');
  });

  test('returns "success" when all repositories are in status "success"', function() {
    const repositories: Repository[] = [
      { status: 'success' },
      { status: 'success' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'success');
  });

  test('returns "pending" when one repository is in status "pending"', function() {
    const repositories: Repository[] = [
      { status: 'success' },
      { status: 'failed' },
      { status: 'pending' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'pending');
  });

  test('returns "pending" when one repository is in status "running"', function() {
    const repositories: Repository[] = [
      { status: 'success' },
      { status: 'failed' },
      { status: 'running' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'pending');
  });

  test('returns "failed" when one repository is in status "failed"', function() {
    const repositories: Repository[] = [
      { status: 'success' },
      { status: 'failed' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'failed');
  });

  test('returns "success" when one repository is in status "skipped"', function() {
    const repositories: Repository[] = [
      { status: 'success' },
      { status: 'skipped' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'success');
  });
});
