import { Func } from 'mocha';
import http from 'http';
import Koa from 'koa';
import compose from 'koa-compose';
import { Middleware } from '@koa/router';
import koaLogger from 'koa-pino-logger';
import bodyParser from 'koa-bodyparser';
import listen from 'test-listen';
import Redis from 'ioredis';

export interface IntegrationTestState {
  redis: Redis.Redis;
}

function createRedis(): Promise<Redis.Redis> {
  return new Promise((resolve) => {
    const redis = new Redis({ host: process.env.REDIS_HOST });
    redis.on('connect', () => resolve(redis));
  });
}

export function withServer<TMiddlewareState>(
  test: (url: string, redis: Redis.Redis) => void | Promise<void>,
  ...middlewareFactories: ((
    redis: Redis.Redis,
  ) => Middleware<TMiddlewareState>)[]
): Func {
  return async () => {
    const redis = await createRedis();
    const app = new Koa<IntegrationTestState>();
    app.use(koaLogger({ enabled: false }));
    app.use(bodyParser());
    app.use(async (ctx, next) => {
      ctx.state.redis = redis;
      await next();
    });
    const middlewares = middlewareFactories.map((middlewareFactory) => {
      return middlewareFactory(redis);
    });
    app.use(compose(middlewares));
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = http.createServer(app.callback());
    const requestUrl = await listen(server);
    try {
      await test(requestUrl, redis);
    } finally {
      server.close();
      await redis.flushall();
      await redis.quit();
    }
  };
}
