import test from 'ava';
import { Repository } from '../../../api/shared/mongodb';
import { getRepositoriesStatus } from '../../../api/shared/repositories';

test('returns "success" when repositories are empty', t => {
  const status = getRepositoriesStatus([]);
  t.is(status, 'success');
});

test('returns "success" when all repositories are in status "success"', t => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'success' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.is(status, 'success');
});

test('returns "pending" when one repository is in status "pending"', t => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
    { name: 'repoC', status: 'pending' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.is(status, 'pending');
});

test('returns "pending" when one repository is in status "running"', t => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
    { name: 'repoC', status: 'running' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.is(status, 'pending');
});

test('returns "failed" when one repository is in status "failed"', t => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.is(status, 'failed');
});
