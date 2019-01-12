import { Logger } from 'azure-functions';
import { GotFn } from 'got';
import verifySecretFn from 'verify-github-webhook-secret';
import { URL } from 'url';

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

const stateTriggerMap = {
  success: 'ci_build_success',
  pending: 'ci_build_pending',
  failure: 'ci_build_failure',
  error: 'ci_build_failure',
};

export async function changeColor(
  logger: Logger,
  body: WebhookJsonBody,
  verifySecret: typeof verifySecretFn,
  secret: string,
  iftttBaseUrl: string,
  iftttKey: string,
  got: GotFn,
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
      const iftttUrl = new URL(
        `trigger/${stateTriggerMap[body.state]}/with/key/${iftttKey}`,
        iftttBaseUrl,
      );
      await got(iftttUrl);
    }
  }
  return { status: 204, body: null };
}
