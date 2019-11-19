import { expect } from 'chai';
import { getConfig, Config } from '../../../api/shared/config';

suite('config', function() {
  test('create config object from environment variables', function() {
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
    expect(actual).to.deep.equal(expected);
  });

  test('initalize config object with defaults when env variables are not set', function() {
    const actual = getConfig();
    const expected: Config = {
      gitlabSecretToken: '',
      iftttBaseUrl: '',
      iftttKey: '',
      mongoDbUri: '',
      sentryDSN: '',
    };
    expect(actual).to.deep.equal(expected);
  });
});
