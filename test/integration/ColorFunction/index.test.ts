import test from 'tape';
import micro from 'micro';
import listen from 'test-listen';
import { Context, HttpRequest } from 'azure-functions';
import sinon from 'sinon';
import { run } from '../../../ColorFunction/';

test('call IFTTT webhook event "ci_build_success"', async t => {
  t.plan(1);
  const service = micro(request => {
    t.equal(request.url, '/trigger/ci_build_success/with/key/my-key');
    service.close();
    delete process.env.GITHUB_SECRET;
    delete process.env.IFTTT_BASE_URL;
    delete process.env.IFTTT_KEY;
    return null;
  });
  const url = await listen(service);
  process.env.GITHUB_SECRET = 'my-secret';
  process.env.IFTTT_BASE_URL = url;
  process.env.IFTTT_KEY = 'my-key';
  const context: Partial<Context> = {
    log: {
      warn: sinon.stub(),
      info: sinon.stub(),
      metric: sinon.stub(),
      verbose: sinon.stub(),
      error: sinon.stub(),
    } as any,
  };
  const req: Partial<HttpRequest> = {
    headers: {
      'x-hub-signature': 'sha1=7222a793428d77051ab41c61ee85305d0ea3da80',
    },
    body: {
      id: 123,
      name: 'test',
      state: 'success',
      branches: [{ name: 'master' }],
    },
  };
  await run(context as Context, req as HttpRequest);
});
