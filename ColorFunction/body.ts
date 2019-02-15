import { Branch } from './branches';

export interface WebhookJsonBody {
  id: number;
  name: string;
  state: 'pending' | 'failure' | 'error' | 'success';
  branches: ReadonlyArray<Branch>;
}

export function isWebhookJsonBody(body: any): body is WebhookJsonBody {
  return (
    body.id !== undefined &&
    body.name !== undefined &&
    body.state !== undefined &&
    body.branches !== undefined
  );
}
