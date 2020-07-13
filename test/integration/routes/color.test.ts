import { suite, test } from 'mocha';
import { assert } from 'chai';
import { Middleware } from '@koa/router';
import got from 'got';
import { withServer } from '../server';
import {
  verifyGitLabToken,
  verifyWebhookEventBody,
  verifyBranch,
  saveStatusInRedis,
  MiddlewareState,
} from '../../../src/routes/color';
import { WebhookEventBody } from '../../../src/body';

function createWebhookEventBody(branch = 'master'): WebhookEventBody {
  return {
    object_attributes: {
      id: 1,
      ref: branch,
      status: 'success',
    },
    project: {
      path_with_namespace: 'my/project',
    },
  };
}

function setContextStateMiddleware(
  branch = 'master',
): Middleware<MiddlewareState> {
  return async (ctx, next) => {
    ctx.state.webhookEvent = createWebhookEventBody(branch);
    await next();
  };
}

const setTestBodyMiddleware: Middleware = (ctx) => {
  ctx.body = 'test passed';
};

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
        const json = createWebhookEventBody();
        const actual = await got.post(requestUrl, { json }).text();
        const expected = 'test passed';
        assert.equal(actual, expected);
      },
      verifyWebhookEventBody,
      setTestBodyMiddleware,
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
      setTestBodyMiddleware,
    ),
  );

  test(
    'verifyBranch middleware calls next middleware when Git branch is valid',
    withServer(
      async (requestUrl) => {
        const actual = await got.post(requestUrl).text();
        const expected = 'test passed';
        assert.equal(actual, expected);
      },
      setContextStateMiddleware(),
      verifyBranch,
      setTestBodyMiddleware,
    ),
  );

  test(
    'verifyBranch middleware returns HTTP 401 when Git branch is not valid',
    withServer(
      async (requestUrl) => {
        const result = await got.post(requestUrl, {
          throwHttpErrors: false,
        });
        const actual = result.statusCode;
        const expected = 400;
        assert.equal(actual, expected);
      },
      setContextStateMiddleware('featureA'),
      verifyBranch,
      setTestBodyMiddleware,
    ),
  );

  test(
    'saveStatusInRedis middleware',
    withServer(
      async (requestUrl, redis) => {
        await got.post(requestUrl, { throwHttpErrors: false });
        const actual = await redis.get('my/project');
        const expected = 'success';
        assert.equal(actual, expected);
      },
      setContextStateMiddleware(),
      (ctx, next) => {
        return saveStatusInRedis(ctx.state.redis)(ctx, next);
      },
    ),
  );
});
