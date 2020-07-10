import { Middleware } from '@koa/router';
import { pipe, curry } from 'rambda';
import { isWebhookEventBody, WebhookEventBody } from '../body';
import { readGitLabTokenFromHeaders, isSecretValid } from '../gitlab';
import { isBranchAllowed } from '../branch';

export interface MiddlewareState {
  webhookEvent: WebhookEventBody;
}

export const verifyGitLabToken: Middleware = async (ctx, next) => {
  const gitLabSecretToken = process.env.GITLAB_SECRET_TOKEN ?? '';
  const curriedIsSecretValid = curry(isSecretValid);
  const isValid = pipe(
    readGitLabTokenFromHeaders,
    curriedIsSecretValid(gitLabSecretToken),
  )(ctx.headers);
  if (isValid) {
    await next();
  } else {
    ctx.throw(401, 'GitHub secret not valid');
  }
};

export const verifyWebhookEventBody: Middleware<MiddlewareState> = async (
  ctx,
  next,
) => {
  const { body } = ctx.request;
  if (isWebhookEventBody(body)) {
    ctx.state = {
      webhookEvent: body,
    };
    await next();
  } else {
    ctx.throw(400, 'Invalid JSON body');
  }
};

export const verifyBranch: Middleware<MiddlewareState> = async (ctx, next) => {
  const { ref } = ctx.state.webhookEvent.object_attributes;
  if (isBranchAllowed(ref)) {
    await next();
  } else {
    ctx.log.info(`Called from "${ref}" instead of main branch. Doing nothing.`);
    ctx.throw(400, 'Invalid Git branch');
  }
};
