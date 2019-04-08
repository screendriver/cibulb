import { Repository, RepositoryStatus } from './mongodb';

export function getRepositoriesStatus(
  repositories: readonly Repository[],
): RepositoryStatus {
  if (repositories.length === 0) {
    return 'success';
  }
  if (repositories.every(({ status }) => status === 'success')) {
    return 'success';
  }
  if (repositories.some(({ status }) => status === 'pending' || status === 'running')) {
    return 'pending';
  }
  return 'failed';
}
