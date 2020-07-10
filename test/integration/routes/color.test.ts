import { suite, test, Func } from 'mocha';
import { assert } from 'chai';
import http from 'http';
import Koa from 'koa';
import Router, { Middleware } from '@koa/router';
import bodyParser from 'koa-bodyparser';
import listen from 'test-listen';
import got from 'got';
import {
  verifyGitLabToken,
  verifyWebhookEventBody,
} from '../../../src/routes/color';
import { WebhookEventBody } from '../../../src/body';

const testMiddleware: Middleware = (ctx) => {
  ctx.body = 'test passed';
};

function withServer(
  test: (url: string) => void | Promise<void>,
  ...middleware: Middleware[]
): Func {
  return async () => {
    const app = new Koa();
    const router = new Router();
    router.post('/color', ...middleware);
    app.use(bodyParser());
    app.use(router.routes());
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const server = http.createServer(app.callback());
    const baseUrl = await listen(server);
    const requestUrl = new URL('/color', baseUrl);
    try {
      await test(requestUrl.href);
    } finally {
      server.close();
    }
  };
}

suite('/color route', function () {
  test(
    'verifyWebhookEventBody middleware returns HTTP 400 when request body is empty',
    withServer(async (requestUrl) => {
      const json = {};
      const result = await got.post(requestUrl, {
        throwHttpErrors: false,
        json,
      });
      const actual = result.statusCode;
      const expected = 400;
      assert.equal(actual, expected);
    }, verifyWebhookEventBody),
  );

  test(
    'verifyWebhookEventBody middleware calls next middleware when request was correct',
    withServer(
      async (requestUrl) => {
        const json: WebhookEventBody = {
          object_attributes: {
            id: 1,
            ref: '',
            status: 'success',
          },
          project: {
            path_with_namespace: '',
          },
        };
        const actual = await got.post(requestUrl, { json }).text();
        const expected = 'test passed';
        assert.equal(actual, expected);
      },
      verifyWebhookEventBody,
      testMiddleware,
    ),
  );

  test(
    'verifyGitLabToken middleware returns HTTP 401 when GitLab token is not set',
    withServer(async (requestUrl) => {
      process.env.GITLAB_SECRET_TOKEN = 'my-secret';
      const result = await got.post(requestUrl, {
        throwHttpErrors: false,
      });
      const actual = result.statusCode;
      const expected = 401;
      assert.equal(actual, expected);
      delete process.env.GITLAB_SECRET_TOKEN;
    }, verifyGitLabToken),
  );

  test(
    'verifyGitLabToken middleware returns HTTP 401 when GitLab token is wrong',
    withServer(async (requestUrl) => {
      process.env.GITLAB_SECRET_TOKEN = 'my-secret';
      const result = await got.post(requestUrl, {
        throwHttpErrors: false,
        headers: {
          'x-gitlab-token': 'abc',
        },
      });
      const actual = result.statusCode;
      const expected = 401;
      assert.equal(actual, expected);
      delete process.env.GITLAB_SECRET_TOKEN;
    }, verifyGitLabToken),
  );

  test(
    'verifyGitLabToken middleware calls next middleware when GitLab token is valid',
    withServer(
      async (requestUrl) => {
        process.env.GITLAB_SECRET_TOKEN = 'my-secret';
        const actual = await got
          .post(requestUrl, {
            throwHttpErrors: false,
            headers: {
              'x-gitlab-token': 'my-secret',
            },
          })
          .text();
        const expected = 'test passed';
        assert.equal(actual, expected);
        delete process.env.GITLAB_SECRET_TOKEN;
      },
      verifyGitLabToken,
      testMiddleware,
    ),
  );
});
