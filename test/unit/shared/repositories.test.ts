import test from 'tape';
import { Repository } from '../../../src/shared/mongodb';
import { getRepositoriesStatus } from '../../../src/shared/repositories';

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
    { name: 'repoB', status: 'error' },
    { name: 'repoC', status: 'pending' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.equal(status, 'pending');
});

test('returns "error" when one repository is in status "error"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'error' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.equal(status, 'error');
});

test('returns "error" when one repository is in status "failure"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failure' },
  ];
  const status = getRepositoriesStatus(repositories);
  t.equal(status, 'error');
});
