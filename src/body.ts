export interface WebhookEventBody {
  object_attributes: {
    id: number;
    ref: string;
    status: 'success' | 'running' | 'skipped' | 'pending' | 'failed';
  };
  project: {
    path_with_namespace: string;
  };
}

export function isWebhookEventBody(body?: unknown): body is WebhookEventBody {
  if (typeof body === 'object' && body !== null) {
    return 'object_attributes' in body && 'project' in body;
  }
  return false;
}
