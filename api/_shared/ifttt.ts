import { Got } from 'got';
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
  got: Got,
): Promise<string> {
  const body = await got(
    `trigger/${statusTriggerMap[status]}/with/key/${config.iftttKey}`,
    { resolveBodyOnly: true, prefixUrl: config.iftttBaseUrl },
  );
  return body;
}
