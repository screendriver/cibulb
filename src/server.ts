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
  app.listen(8080, () => {
    logger.info('Server listening on port 8080');
  });
}

startServer();
