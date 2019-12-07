import { assert } from 'chai';
import sinon from 'sinon';
import { Got } from 'got';
import { Config } from '../../../api/_shared/config';
import { callIftttWebhook } from '../../../api/_shared/ifttt';

const config: Config = {
  gitlabSecretToken: 'my-secret',
  iftttBaseUrl: 'https://ift.tt',
  iftttKey: 'my-secret-key',
  mongoDbUri: 'mongodb+srv://',
  sentryDSN: 'https://123@sentry.io/456',
};

suite('ifttt', function() {
  test('call IFTTT webhook with "success" status', async function() {
    const got = sinon.fake.resolves({ body: '' });
    await callIftttWebhook('success', config, (got as unknown) as Got);

    sinon.assert.calledWith(
      got,
      `trigger/ci_build_success/with/key/${config.iftttKey}`,
      { resolveBodyOnly: true, prefixUrl: config.iftttBaseUrl },
    );
  });

  test('call IFTTT webhook with "pending" status', async function() {
    const got = sinon.fake.resolves({ body: '' });
    await callIftttWebhook('pending', config, (got as unknown) as Got);

    sinon.assert.calledWith(
      got,
      `trigger/ci_build_pending/with/key/${config.iftttKey}`,
      { resolveBodyOnly: true, prefixUrl: config.iftttBaseUrl },
    );
  });

  test('call IFTTT webhook with "failed" status', async function() {
    const got = sinon.fake.resolves({ body: '' });
    await callIftttWebhook('failed', config, (got as unknown) as Got);

    sinon.assert.calledWith(
      got,
      `trigger/ci_build_failure/with/key/${config.iftttKey}`,
      { resolveBodyOnly: true, prefixUrl: config.iftttBaseUrl },
    );
  });

  test('return IFTTT response body', async function() {
    const body = 'Congratulations!';
    const got = sinon.fake.resolves(body);
    const actual = await callIftttWebhook(
      'success',
      config,
      (got as unknown) as Got,
    );
    assert.deepEqual(actual, body);
  });
});
