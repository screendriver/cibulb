import { WebhookJsonBody } from './body';

export type Repository = Pick<WebhookJsonBody, 'state'>;

export function getRepositoriesState(
  repositories: ReadonlyArray<Repository>,
): WebhookJsonBody['state'] {
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
