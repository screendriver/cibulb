import { suite, test } from 'mocha';
import { assert } from 'chai';
import got from 'got';
import http from 'http';
import Koa from 'koa';
import listen from 'test-listen';
import { withServer } from './server';
import { triggerIfttt } from '../../src/ifttt';

suite('ifttt middleware', function () {
  test(
    '',
    withServer(
      async function (requestUrl, redis) {
        let iftttRequestUrl = '';
        await redis.set('my-repository', 'success');
        const app = new Koa();
        app.use((ctx) => {
          ctx.status = 200;
          iftttRequestUrl = ctx.request.url;
        });
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const iftttServer = http.createServer(app.callback());
        const iftttBaseUrl = await listen(iftttServer);
        process.env.IFTTT_KEY = 'secret-test-key';
        process.env.IFTTT_BASE_URL = iftttBaseUrl;
        await got(requestUrl).text();
        iftttServer.close();
        delete process.env.IFTTT_KEY;
        delete process.env.IFTTT_BASE_URL;
        assert.equal(
          iftttRequestUrl,
          '/trigger/ci_build_success/with/key/secret-test-key',
        );
      },
      (redis) => triggerIfttt(redis),
    ),
  );
});
