import { Middleware } from '@koa/router';
import curry from 'lodash/curry';
import flow from 'lodash/flow';
import { RedisClient } from 'redis';
import { isWebhookEventBody, WebhookEventBody } from '../body';
import { readGitLabTokenFromHeaders, isSecretValid } from '../gitlab';
import { isBranchAllowed } from '../branch';

export interface MiddlewareState {
  webhookEvent: WebhookEventBody;
}

export const verifyGitLabToken: Middleware = async (ctx, next) => {
  const gitLabSecretToken = process.env.GITLAB_SECRET_TOKEN ?? '';
  const curriedIsSecretValid = curry(isSecretValid);
  const isValid = flow(
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

export function changeColor(
  redisClient: RedisClient,
): Middleware<MiddlewareState> {
  return (ctx, next) => {
    const { webhookEvent } = ctx.state;
    redisClient.set(
      webhookEvent.project.path_with_namespace,
      webhookEvent.object_attributes.status,
      (error) => {
        if (error) {
          ctx.log.error('Error while writing to Redis', error);
        } else {
          next();
        }
      },
    );
  };
}
