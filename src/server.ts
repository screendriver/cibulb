import http from 'http';
import https from 'https';
import fs from 'fs';
import Koa from 'koa';
import Router from '@koa/router';
import koaLogger from 'koa-pino-logger';
import bodyParser from 'koa-bodyparser';
import pino from 'pino';
import {
  verifyGitLabToken,
  verifyWebhookEventBody,
  verifyBranch,
  saveStatusInRedis,
} from './routes/color';
import { triggerIfttt } from './ifttt';
import { createRedis } from './redis';

const logger = pino({
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

async function startServer() {
  const app = new Koa();
  const router = new Router();
  const redis = await createRedis(logger);

  router.post(
    '/color',
    verifyGitLabToken,
    verifyWebhookEventBody,
    verifyBranch,
    saveStatusInRedis(redis),
    triggerIfttt(redis),
  );

  router.get('/refresh', triggerIfttt(redis));

  app.use(koaLogger({ logger }));
  app.use(bodyParser());
  app.use(router.routes());
  const options: https.ServerOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH ?? ''),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH ?? ''),
  };
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  http.createServer(options, app.callback()).listen(8080, () => {
    logger.info('Server listening on port 8080');
  });
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  https.createServer(options, app.callback()).listen(8081, () => {
    logger.info('Server listening on port 8081');
  });
}

startServer().catch((error) => logger.error(error));
