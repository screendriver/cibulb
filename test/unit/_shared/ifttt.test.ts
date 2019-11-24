import { assert } from 'chai';
import sinon from 'sinon';
import { GotFn } from 'got';
import { URL } from 'url';
import { Config } from '../../../api/_shared/config';
import { callIftttWebhook } from '../../../api/_shared/ifttt';

const config: Config = {
  gitlabSecretToken: 'my-secret',
  iftttBaseUrl: 'https://ift.tt',
  iftttKey: 'my-secret-key',
  mongoDbUri: 'mongodb+srv://',
  sentryDSN: 'https://123@sentry.io/456',
};

function createIftttUrl(status: string): URL {
  return new URL(
    `trigger/${status}/with/key/${config.iftttKey}`,
    config.iftttBaseUrl,
  );
}

suite('ifttt', function() {
  test('call IFTTT webhook with "success" status', async function() {
    const got = sinon.fake.resolves({ body: '' });
    await callIftttWebhook('success', config, got as GotFn);

    const iftttUrl = createIftttUrl('ci_build_success');
    sinon.assert.calledWith(got, iftttUrl);
  });

  test('call IFTTT webhook with "running" status', async function() {
    const got = sinon.fake.resolves({ body: '' });
    await callIftttWebhook('running', config, got as GotFn);

    const iftttUrl = createIftttUrl('ci_build_pending');
    sinon.assert.calledWith(got, iftttUrl);
  });

  test('call IFTTT webhook with "pending" status', async function() {
    const got = sinon.fake.resolves({ body: '' });
    await callIftttWebhook('pending', config, got as GotFn);

    const iftttUrl = createIftttUrl('ci_build_pending');
    sinon.assert.calledWith(got, iftttUrl);
  });

  test('call IFTTT webhook with "failed" status', async function() {
    const got = sinon.fake.resolves({ body: '' });
    await callIftttWebhook('failed', config, got as GotFn);

    const iftttUrl = createIftttUrl('ci_build_failure');
    sinon.assert.calledWith(got, iftttUrl);
  });

  test('return IFTTT response body', async function() {
    const body = 'Congratulations!';
    const got = sinon.fake.resolves({ body });
    const actual = await callIftttWebhook('success', config, got as GotFn);
    assert.deepEqual(actual, body);
  });
});
