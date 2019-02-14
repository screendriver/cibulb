import { Logger } from '@azure/functions';
import { GotFn } from 'got';
import { URL } from 'url';
import { Config } from './config';

const stateTriggerMap = {
  success: 'ci_build_success',
  pending: 'ci_build_pending',
  failure: 'ci_build_failure',
  error: 'ci_build_failure',
};

export async function callIftttWebhook(
  state: 'pending' | 'failure' | 'error' | 'success',
  config: Config,
  logger: Logger,
  got: GotFn,
): Promise<string> {
  const iftttUrl = new URL(
    `trigger/${stateTriggerMap[state]}/with/key/${config.iftttKey}`,
    config.iftttBaseUrl,
  );
  logger.info(`Calling IFTTT webhook with "${state}" state`);
  const { body } = await got(iftttUrl);
  logger.info(body);
  return body;
}
