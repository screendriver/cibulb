import { GotFn } from 'got';
import { URL } from 'url';
import { Config } from '../shared/config';
import { Status } from './repositories';

const statusTriggerMap = {
  success: 'ci_build_success',
  running: 'ci_build_pending',
  pending: 'ci_build_pending',
  failed: 'ci_build_failure',
};

export async function callIftttWebhook(
  status: Status,
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
