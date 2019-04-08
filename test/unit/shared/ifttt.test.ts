import test from 'tape';
import sinon from 'sinon';
import { GotFn } from 'got';
import { URL } from 'url';
import { Config } from '../../../src/shared/config';
import { callIftttWebhook } from '../../../src/shared/ifttt';

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

test('call IFTTT webhook with "success" status', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('success', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_success');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "running" status', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('running', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_pending');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "pending" status', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('pending', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_pending');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "failed" status', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  await callIftttWebhook('failed', config, got as GotFn);

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
