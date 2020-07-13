import got, { Got } from 'got';
import { Context } from 'koa';
import { Middleware } from '@koa/router';
import { Redis } from 'ioredis';
import pPipe from 'p-pipe';
import curry from 'lodash/curry';
import { RepositoriesStatus, getRepositoriesStatus } from './repositories';
import { getAllKeys, getAllValues } from './redis';

export type IftttTriggerName =
  | 'ci_build_success'
  | 'ci_build_pending'
  | 'ci_build_failure';

export function mapStatusToTriggerName(
  overallStatus: RepositoriesStatus,
): IftttTriggerName {
  switch (overallStatus) {
    case 'success':
      return 'ci_build_success';
    case 'pending':
      return 'ci_build_pending';
    case 'failed':
    default:
      return 'ci_build_failure';
  }
}

function callIfttt(
  got: Got,
  iftttKey: string,
  iftttBaseUrl: string,
  trigger: IftttTriggerName,
) {
  return got(`trigger/${trigger}/with/key/${iftttKey}`, {
    prefixUrl: iftttBaseUrl,
    resolveBodyOnly: true,
  });
}

function logResponse(ctx: Context, response: string) {
  ctx.log.info(response);
  return response;
}

export function triggerIfttt(redis: Redis): Middleware {
  return async (ctx, next) => {
    const iftttKey = process.env.IFTTT_KEY ?? '';
    const iftttBaseUrl = process.env.IFTTT_BASE_URL ?? '';
    const iftttResponse = await pPipe(
      getAllKeys,
      curry(getAllValues)(redis),
      (values) => Promise.all(values),
      getRepositoriesStatus,
      mapStatusToTriggerName,
      curry(callIfttt)(got, iftttKey, iftttBaseUrl),
      curry(logResponse)(ctx),
    )(redis);
    ctx.status = 200;
    ctx.body = iftttResponse;
    await next();
  };
}
