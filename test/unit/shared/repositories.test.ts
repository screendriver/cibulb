import { Repository } from '../../../api/shared/mongodb';
import { getRepositoriesStatus } from '../../../api/shared/repositories';

test('returns "success" when repositories are empty', () => {
  const status = getRepositoriesStatus([]);
  expect(status).toBe('success');
});

test('returns "success" when all repositories are in status "success"', () => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'success' },
  ];
  const status = getRepositoriesStatus(repositories);
  expect(status).toBe('success');
});

test('returns "pending" when one repository is in status "pending"', () => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
    { name: 'repoC', status: 'pending' },
  ];
  const status = getRepositoriesStatus(repositories);
  expect(status).toBe('pending');
});

test('returns "pending" when one repository is in status "running"', () => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
    { name: 'repoC', status: 'running' },
  ];
  const status = getRepositoriesStatus(repositories);
  expect(status).toBe('pending');
});

test('returns "failed" when one repository is in status "failed"', () => {
  const repositories: Repository[] = [
    { name: 'repoA', status: 'success' },
    { name: 'repoB', status: 'failed' },
  ];
  const status = getRepositoriesStatus(repositories);
  expect(status).toBe('failed');
});
