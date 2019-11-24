import { assert } from 'chai';
import { Repository } from '../../../api/_shared/mongodb';
import { getRepositoriesStatus } from '../../../api/_shared/repositories';

suite('repositories', function() {
  test('returns "success" when repositories are empty', function() {
    const status = getRepositoriesStatus([]);
    assert.equal(status, 'success');
  });

  test('returns "success" when all repositories are in status "success"', function() {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'success' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'success');
  });

  test('returns "pending" when one repository is in status "pending"', function() {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'failed' },
      { name: 'repoC', status: 'pending' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'pending');
  });

  test('returns "pending" when one repository is in status "running"', function() {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'failed' },
      { name: 'repoC', status: 'running' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'pending');
  });

  test('returns "failed" when one repository is in status "failed"', function() {
    const repositories: Repository[] = [
      { name: 'repoA', status: 'success' },
      { name: 'repoB', status: 'failed' },
    ];
    const status = getRepositoriesStatus(repositories);
    assert.equal(status, 'failed');
  });
});
