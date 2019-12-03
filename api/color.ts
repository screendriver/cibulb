import { NowRequest, NowResponse } from '@now/node';
import log from 'loglevel';
import * as Sentry from '@sentry/node';
import { json } from 'micro';
import { getConfig } from './_shared/config';
import { initSentry } from './_shared/sentry';
import { WebhookRequestBody } from './_color/body';
import { xGitlabToken } from './_color/headers';
import { run } from './_color/run';

log.enableAll();

export default async function color(req: NowRequest, res: NowResponse) {
  const config = getConfig();
  initSentry(Sentry, config, log);
  try {
    const body = (await json(req)) as WebhookRequestBody;
    const token = xGitlabToken(req);
    const result = await run(config, body, token);
    res.statusCode = result.statusCode;
    res.send(result.text);
  } catch (e) {
    Sentry.captureException(e);
  }
}
