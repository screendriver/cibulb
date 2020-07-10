import Koa from 'koa';
import Router from '@koa/router';
import koaLogger from 'koa-pino-logger';
import bodyParser from 'koa-bodyparser';
import pino from 'pino';
import { verifyGitLabToken, verifyWebhookEventBody } from './routes/color';

const logger = pino();
const app = new Koa();
const router = new Router();

router.post('/color', verifyGitLabToken, verifyWebhookEventBody);

app.use(koaLogger({ logger }));
app.use(bodyParser());
app.use(router.routes());
app.listen(8080, () => {
  logger.info('Server listening on port 8080');
});
