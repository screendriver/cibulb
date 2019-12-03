import { GotFn } from 'got';
import { URL } from 'url';
import { Config } from './config';
import { RepositoriesStatus } from './repositories';

const statusTriggerMap = {
  success: 'ci_build_success',
  pending: 'ci_build_pending',
  failed: 'ci_build_failure',
};

export async function callIftttWebhook(
  status: RepositoriesStatus,
  config: Config,
  got: GotFn,
): Promise<string> {
  const iftttUrl = new URL(
    `trigger/${statusTriggerMap[status]}/with/key/${config.iftttKey}`,
    config.iftttBaseUrl,
  );
  const { body } = await got(iftttUrl);
  return body;
}
