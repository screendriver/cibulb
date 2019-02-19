import { Repository } from './mongodb';

export function getRepositoriesState(
  repositories: ReadonlyArray<Repository>,
): Repository['state'] {
  if (repositories.length === 0) {
    return 'success';
  }
  if (repositories.every(({ state }) => state === 'success')) {
    return 'success';
  }
  if (repositories.some(({ state }) => state === 'pending')) {
    return 'pending';
  }
  return 'error';
}
