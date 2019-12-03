import { Repository } from '../_shared/repositories';

export interface WebhookRequestBody {
  object_attributes: {
    id: number;
    ref: string;
    status: Repository['status'];
  };
  project: {
    path_with_namespace: string;
  };
}

export function isWebhookRequestBody(body: any): body is WebhookRequestBody {
  const { object_attributes, project } = body;
  return (
    object_attributes !== undefined &&
    object_attributes.id !== undefined &&
    object_attributes.ref !== undefined &&
    object_attributes.status !== undefined &&
    project !== undefined &&
    project.path_with_namespace !== undefined
  );
}
