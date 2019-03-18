import test from 'tape';
import sinon from 'sinon';
import { GotFn } from 'got';
import { URL } from 'url';
import { Config } from '../../../src/shared/config';
import { callIftttWebhook } from '../../../src/shared/ifttt';

const config: Config = {
  githubSecret: 'my-secret',
  iftttBaseUrl: 'https://ift.tt',
  iftttKey: 'my-secret-key',
  mongoDbUri: 'mongodb+srv://',
  sentryDSN: 'https://123@sentry.io/456',
};

function createIftttUrl(state: string): URL {
  return new URL(
    `trigger/${state}/with/key/${config.iftttKey}`,
    config.iftttBaseUrl,
  );
}

test('call IFTTT webhook with "success" state', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('success', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_success');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "pending" state', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('pending', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_pending');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "failure" state', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('failure', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_failure');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "error" state', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('error', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_failure');
  t.true(got.calledWith(iftttUrl));
});

test('return IFTTT response body', async t => {
  t.plan(1);
  const body = 'Congratulations!';
  const got = sinon.stub().returns({ body });
  const actual = await callIftttWebhook('success', config, got as GotFn);
  t.equal(actual, body);
});
