import { Branch } from './branches';
import { Repository } from '../shared/mongodb';

export interface WebhookRequestBody extends Repository {
  id: number;
  branches: readonly Branch[];
}

export function isWebhookJsonBody(body: any): body is WebhookRequestBody {
  return (
    body.id !== undefined &&
    body.name !== undefined &&
    body.state !== undefined &&
    body.branches !== undefined
  );
}
