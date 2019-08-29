import { GotFn } from 'got';
import { URL } from 'url';
import { Config } from '../../../api/shared/config';
import { callIftttWebhook } from '../../../api/shared/ifttt';

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

test('call IFTTT webhook with "success" status', async () => {
  const got = jest.fn().mockResolvedValue({ body: '' });
  await callIftttWebhook('success', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_success');
  expect(got).toHaveBeenCalledWith(iftttUrl);
});

test('call IFTTT webhook with "running" status', async () => {
  const got = jest.fn().mockResolvedValue({ body: '' });
  await callIftttWebhook('running', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_pending');
  expect(got).toHaveBeenCalledWith(iftttUrl);
});

test('call IFTTT webhook with "pending" status', async () => {
  const got = jest.fn().mockResolvedValue({ body: '' });
  await callIftttWebhook('pending', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_pending');
  expect(got).toHaveBeenCalledWith(iftttUrl);
});

test('call IFTTT webhook with "failed" status', async () => {
  const got = jest.fn().mockResolvedValue({ body: '' });
  await callIftttWebhook('failed', config, got as GotFn);

  const iftttUrl = createIftttUrl('ci_build_failure');
  expect(got).toHaveBeenCalledWith(iftttUrl);
});

test('return IFTTT response body', async () => {
  const body = 'Congratulations!';
  const got = jest.fn().mockResolvedValue({ body });
  const actual = await callIftttWebhook('success', config, got as GotFn);
  expect(actual).toEqual(body);
});
