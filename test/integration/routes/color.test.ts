import { suite, test, Func } from 'mocha';
import { assert } from 'chai';
import http from 'http';
import Koa from 'koa';
import Router, { Middleware } from '@koa/router';
import bodyParser from 'koa-bodyparser';
import listen from 'test-listen';
import got from 'got';
import { color } from '../../../src/routes/color';

function withServer(
  path: string,
  method: 'post',
  middleware: Middleware,
  test: (url: string) => void | Promise<void>,
): Func {
  return async () => {
    const app = new Koa();
    const router = new Router();
    router[method](path, middleware);
    app.use(bodyParser());
    app.use(router.routes());
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = http.createServer(app.callback());
    const url = await listen(server);
    try {
      await test(url);
    } finally {
      server.close();
    }
  };
}

suite('/color route', function () {
  test(
    'returns HTTP 400 when request body is empty',
    withServer('/color', 'post', color, async (baseUrl) => {
      const requestUrl = new URL('/color', baseUrl);
      const json = {};
      const result = await got.post(requestUrl, {
        throwHttpErrors: false,
        json,
      });
      const actual = result.statusCode;
      const expected = 400;
      assert.equal(actual, expected);
    }),
  );
});
