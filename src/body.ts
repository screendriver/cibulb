interface Repository {
  name: string;
  status: 'success' | 'running' | 'skipped' | 'pending' | 'failed';
}

export interface WebhookEventBody {
  object_attributes: {
    id: number;
    ref: string;
    status: Repository['status'];
  };
  project: {
    path_with_namespace: string;
  };
}

export function assertHasEventBody(
  body: string | null,
): asserts body is string {
  if (body === null) {
    throw new TypeError("body can't be null");
  }
}

export function parseEventBody(body: string): WebhookEventBody {
  return JSON.parse(body);
}
