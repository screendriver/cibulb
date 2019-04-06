import { Branch } from './branches';
import { Repository } from '../shared/mongodb';

export interface WebhookJsonBody extends Repository {
  id: number;
  branches: readonly Branch[];
}

export function isWebhookJsonBody(body: any): body is WebhookJsonBody {
  return (
    body.id !== undefined &&
    body.name !== undefined &&
    body.state !== undefined &&
    body.branches !== undefined
  );
}
