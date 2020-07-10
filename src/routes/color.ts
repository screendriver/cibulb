import { Middleware } from '@koa/router';
import { isWebhookEventBody } from '../body';

export const color: Middleware = (ctx) => {
  const { body } = ctx.request;
  if (!isWebhookEventBody(body)) {
    ctx.throw(400, 'Invalid JSON body');
  }
};
