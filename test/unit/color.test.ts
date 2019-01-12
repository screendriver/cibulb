import test from 'tape';
import { Logger } from 'azure-functions';
import sinon from 'sinon';
import {
  changeColor,
  WebhookJsonBody,
  ColorChange,
} from '../../ColorFunction/color';
import { URL } from 'url';

function createTestData(
  body: WebhookJsonBody = {},
  verifySecretReturns = true,
) {
  const logger: Partial<Logger> = {
    error: sinon.stub(),
  };
  const verifySecret = sinon.stub().returns(verifySecretReturns);
  const secret = 'my-secret';
  const iftttBaseUrl = 'https://maker.ifttt.com';
  const iftttKey = 'my-key';
  const got = sinon.stub();
  return { logger, body, verifySecret, secret, iftttBaseUrl, iftttKey, got };
}

test('return status 403 when GitHub secret is not valid', async t => {
  t.plan(1);
  const {
    logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  } = createTestData({}, false);
  const actual = await changeColor(
    logger as Logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  );
  const expected: ColorChange = { status: 403, body: 'Forbidden' };
  t.deepEqual(actual, expected);
});

async function callIftttApi(state: WebhookJsonBody['state']): Promise<URL> {
  const logger: Partial<Logger> = {
    error: sinon.stub(),
  };
  const body: WebhookJsonBody = {
    id: 123,
    name: 'test',
    state,
    branches: [{ name: 'master' }],
  };
  const verifySecret = sinon.stub().returns(true);
  const secret = 'my-secret';
  const iftttBaseUrl = 'https://maker.ifttt.com';
  const iftttKey = 'my-key';
  const got = sinon.stub();
  await changeColor(
    logger as Logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  );
  return got.args[0][0];
}

test('call IFTTT API when master branch state is "success"', async t => {
  t.plan(1);
  const actual = await callIftttApi('success');
  t.equal(
    actual.toString(),
    'https://maker.ifttt.com/trigger/ci_build_success/with/key/my-key',
  );
});

test('call IFTTT API when master branch state is "pending"', async t => {
  t.plan(1);
  const actual = await callIftttApi('pending');
  t.equal(
    actual.toString(),
    'https://maker.ifttt.com/trigger/ci_build_pending/with/key/my-key',
  );
});

test('call IFTTT API when master branch state is "failure"', async t => {
  t.plan(1);
  const actual = await callIftttApi('failure');
  t.equal(
    actual.toString(),
    'https://maker.ifttt.com/trigger/ci_build_failure/with/key/my-key',
  );
});

test('call IFTTT API when master branch state is "error"', async t => {
  t.plan(1);
  const actual = await callIftttApi('error');
  t.equal(
    actual.toString(),
    'https://maker.ifttt.com/trigger/ci_build_failure/with/key/my-key',
  );
});

test('do not call IFTTT API when branch is not master', async t => {
  t.plan(1);
  const bodyOverride: WebhookJsonBody = {
    id: 123,
    name: 'test',
    state: 'success',
    branches: [{ name: 'feature-a' }],
  };
  const {
    logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  } = createTestData(bodyOverride, true);
  await changeColor(
    logger as Logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  );
  t.false(got.called);
});

test('do not call IFTTT API when body fields are missing', async t => {
  t.plan(1);
  const bodyOverride: WebhookJsonBody = {
    branches: [{ name: 'feature-a' }],
  };
  const {
    logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  } = createTestData(bodyOverride, true);
  await changeColor(
    logger as Logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  );
  t.false(got.called);
});

test('return status 204 when everything was fine', async t => {
  t.plan(1);
  const bodyOverride: WebhookJsonBody = {
    id: 123,
    name: 'test',
    state: 'success',
    branches: [{ name: 'master' }],
  };
  const {
    logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  } = createTestData(bodyOverride, true);
  const actual = await changeColor(
    logger as Logger,
    body,
    verifySecret,
    secret,
    iftttBaseUrl,
    iftttKey,
    got,
  );
  const expected: ColorChange = { status: 204, body: null };
  t.deepEqual(actual, expected);
});
