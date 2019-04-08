import { Repository } from './mongodb';

export type Status = 'success' | 'running' | 'pending' | 'failed';
export function getRepositoriesStatus(
  repositories: readonly Repository[],
): Status {
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
