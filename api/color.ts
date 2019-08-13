import { NowRequest, NowResponse } from '@now/node';
import log from 'loglevel';
import * as Sentry from '@sentry/node';
import { json } from 'micro';
import { startMongoDbMemoryServer } from './shared/mongodb';
import { getConfig } from './shared/config';
import { initSentry } from './shared/sentry';
import { WebhookRequestBody } from './color/body';
import { xGitlabToken } from './color/headers';
import { run } from './color/run';

log.enableAll();

export default async function color(req: NowRequest, res: NowResponse) {
  if (process.env.NODE_ENV === 'development') {
    process.env.MONGO_URI = await startMongoDbMemoryServer();
  }
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
