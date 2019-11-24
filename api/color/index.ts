import { NowRequest, NowResponse } from '@now/node';
import log from 'loglevel';
import * as Sentry from '@sentry/node';
import { json } from 'micro';
import { Server } from 'http';
import { startMongoDbMemoryServer } from '../_shared/mongodb';
import { getConfig } from '../_shared/config';
import { initSentry } from '../_shared/sentry';
import { WebhookRequestBody } from '../color/body';
import { xGitlabToken } from '../color/headers';
import { run } from '../color/run';
import { startLocalIftttServer } from '../_shared/ifttt';

log.enableAll();

export default async function color(req: NowRequest, res: NowResponse) {
  let localIftttServer: Server | undefined;
  if (process.env.NODE_ENV === 'development') {
    process.env.MONGO_URI = await startMongoDbMemoryServer();
    localIftttServer = await startLocalIftttServer();
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
  } finally {
    if (localIftttServer) {
      localIftttServer.close();
    }
  }
}
