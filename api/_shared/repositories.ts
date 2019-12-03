export interface Repository {
  name: string;
  status: 'success' | 'running' | 'skipped' | 'pending' | 'failed';
}

export type RepositoriesStatus = 'success' | 'pending' | 'failed';

export function getRepositoriesStatus(
  repositories: readonly Repository[],
): RepositoriesStatus {
  if (repositories.length === 0) {
    return 'success';
  }
  if (
    repositories.some(
      ({ status }) => status === 'pending' || status === 'running',
    )
  ) {
    return 'pending';
  }
  if (repositories.some(({ status }) => status === 'failed')) {
    return 'failed';
  }
  return 'success';
}
