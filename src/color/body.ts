export interface WebhookRequestBody {
  object_attributes: {
    id: number;
    ref: string;
    status: 'success';
  };
  project: {
    name: string;
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
    project.name !== undefined
  );
}
