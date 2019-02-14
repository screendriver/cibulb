import test from 'tape';
import sinon from 'sinon';
import { GotFn } from 'got';
import { Logger } from '@azure/functions';
import { URL } from 'url';
import { Config } from '../../../ColorFunction/config';
import { callIftttWebhook } from '../../../ColorFunction/ifttt';

const config: Config = {
  githubSecret: 'my-secret',
  iftttBaseUrl: 'https://ift.tt',
  iftttKey: 'my-secret-key',
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
  const logger: Partial<Logger> = {
    info: sinon.stub(),
  };
  await callIftttWebhook('success', config, logger as Logger, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_success');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "pending" state', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  const logger: Partial<Logger> = {
    info: sinon.stub(),
  };
  await callIftttWebhook('pending', config, logger as Logger, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_pending');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "failure" state', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  const logger: Partial<Logger> = {
    info: sinon.stub(),
  };
  await callIftttWebhook('failure', config, logger as Logger, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_failure');
  t.true(got.calledWith(iftttUrl));
});

test('call IFTTT webhook with "error" state', async t => {
  t.plan(1);
  const got = sinon.stub().returns({ body: '' });
  const logger: Partial<Logger> = {
    info: sinon.stub(),
  };
  await callIftttWebhook('error', config, logger as Logger, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_failure');
  t.true(got.calledWith(iftttUrl));
});

test('return IFTTT response body', async t => {
  t.plan(1);
  const body = 'Congratulations!';
  const got = sinon.stub().returns({ body });
  const logger: Partial<Logger> = {
    info: sinon.stub(),
  };
  const actual = await callIftttWebhook(
    'success',
    config,
    logger as Logger,
    got as GotFn,
  );
  t.equal(actual, body);
});
