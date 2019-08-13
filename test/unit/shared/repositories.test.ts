import test from 'tape';
import { Repository } from '../../../api/shared/mongodb';
import { getRepositoriesStatus } from '../../../api/shared/repositories';

test('returns "success" when repositories are empty', t => {
  t.plan(1);
  const status = getRepositoriesStatus([]);
  t.equal(status, 'success');
});

test('returns "success" when all repositories are in status "success"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'success' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.equal(status, 'success');
});

test('returns "pending" when one repository is in status "pending"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
    { name: 'repoC', status: 'pending' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.equal(status, 'pending');
});

test('returns "pending" when one repository is in status "running"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
    { name: 'repoC', status: 'running' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.equal(status, 'pending');
});

test('returns "failed" when one repository is in status "failed"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.equal(status, 'failed');
});
