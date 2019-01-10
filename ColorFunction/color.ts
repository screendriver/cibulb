import { Logger } from 'azure-functions';
import verifySecretFn from 'verify-github-webhook-secret';

export interface WebhookJsonBody {
  id?: number;
  name?: string;
  state?: 'pending' | 'failure' | 'error' | 'success';
  branches?: Array<{ name: string }>;
}

export interface ColorChange {
  status: number;
  body: string | null;
}

export async function changeColor(
  logger: Logger,
  body: WebhookJsonBody,
  verifySecret: typeof verifySecretFn,
  secret: string,
  iftttKey: string,
  xHubSignature?: string | string[],
): Promise<ColorChange> {
  const bodyAsString = JSON.stringify(body);
  const valid = await verifySecret(bodyAsString, secret, xHubSignature);
  if (!valid) {
    logger.error('GitHub secret is not valid');
    return { status: 403, body: 'Forbidden' };
  }
  if (body.id && body.name && body.state && body.branches) {
    if (body.branches.map(({ name }) => name).includes('master')) {
    }
  }
  return { status: 204, body: null };
}
