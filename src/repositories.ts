export interface Repository {
  status: 'success' | 'running' | 'skipped' | 'pending' | 'failed';
}

export type RepositoriesStatus = 'success' | 'pending' | 'failed';

function checkFailedStatus(
  repositories: readonly Repository[],
): RepositoriesStatus {
  return repositories.some(({ status }) => status === 'failed')
    ? 'failed'
    : 'success';
}

function getStatusForNonEmptyRepos(
  repositories: readonly Repository[],
): RepositoriesStatus {
  return repositories.some(
    ({ status }) => status === 'pending' || status === 'running',
  )
    ? 'pending'
    : checkFailedStatus(repositories);
}

function isEmpty(repositories: readonly Repository[]): boolean {
  return repositories.length === 0;
}

export function getRepositoriesStatus(
  repositories: readonly Repository[],
): RepositoriesStatus {
  return isEmpty(repositories)
    ? 'success'
    : getStatusForNonEmptyRepos(repositories);
}
