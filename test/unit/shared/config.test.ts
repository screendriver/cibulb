import test from 'tape';
import { getConfig, Config } from '../../../src/shared/config';

test('create config object from environment variables', t => {
  t.plan(1);
  process.env.GITLAB_SECRET_TOKEN = 'my-secret';
  process.env.IFTTT_BASE_URL = 'http://localhost';
  process.env.IFTTT_KEY = 'my-key';
  process.env.MONGO_URI = 'mongodb+srv://';
  process.env.SENTRY_DSN = 'https://123@sentry.io/456';
  const actual = getConfig();
  const expected: Config = {
    gitlabSecretToken: 'my-secret',
    iftttBaseUrl: 'http://localhost',
    iftttKey: 'my-key',
    mongoDbUri: 'mongodb+srv://',
    sentryDSN: 'https://123@sentry.io/456',
  };
  delete process.env.GITLAB_SECRET_TOKEN;
  delete process.env.IFTTT_BASE_URL;
  delete process.env.IFTTT_KEY;
  delete process.env.MONGO_URI;
  delete process.env.SENTRY_DSN;
  t.deepEqual(actual, expected);
});

test('initalize config object with defaults when env variables are not set', t => {
  t.plan(1);
  const actual = getConfig();
  const expected: Config = {
    gitlabSecretToken: '',
    iftttBaseUrl: '',
    iftttKey: '',
    mongoDbUri: '',
    sentryDSN: '',
  };
  t.deepEqual(actual, expected);
});
