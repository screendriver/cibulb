import { GotFn } from 'got';
import { URL } from 'url';
import { RepositoryState } from './mongodb';
import { Config } from '../shared/config';

const stateTriggerMap = {
  success: 'ci_build_success',
  pending: 'ci_build_pending',
  failure: 'ci_build_failure',
  error: 'ci_build_failure',
};

export async function callIftttWebhook(
  state: RepositoryState,
  config: Config,
  got: GotFn,
): Promise<string> {
  const iftttUrl = new URL(
    `trigger/${stateTriggerMap[state]}/with/key/${config.iftttKey}`,
    config.iftttBaseUrl,
  );
  const { body } = await got(iftttUrl);
  return body;
}
