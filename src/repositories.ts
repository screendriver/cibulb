export type RepositoriesStatus = 'success' | 'pending' | 'failed';

export type RepositoryStatus =
  | 'success'
  | 'running'
  | 'skipped'
  | 'pending'
  | 'failed';

function filterNull(
  statusList: ReadonlyArray<RepositoryStatus | null>,
): readonly RepositoryStatus[] {
  return statusList.filter(
    (status): status is RepositoryStatus => status !== null,
  );
}

function isEmpty(statusList: ReadonlyArray<string | null>): boolean {
  return statusList.length === 0;
}

function checkFailedStatus(
  statusList: readonly RepositoryStatus[],
): RepositoriesStatus {
  return statusList.some((status) => status === 'failed')
    ? 'failed'
    : 'success';
}

function checkPending(
  statusList: readonly RepositoryStatus[],
): RepositoriesStatus {
  return statusList.some(
    (status) => status === 'pending' || status === 'running',
  )
    ? 'pending'
    : checkFailedStatus(statusList);
}

export function getRepositoriesStatus(
  statusList: ReadonlyArray<RepositoryStatus | null>,
): RepositoriesStatus {
  const nonNullStatusList = filterNull(statusList);
  return isEmpty(nonNullStatusList)
    ? 'success'
    : checkPending(nonNullStatusList);
}
