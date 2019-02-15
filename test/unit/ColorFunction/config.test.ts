import test from 'tape';
import { getConfig, Config } from '../../../ColorFunction/config';

test('create config object from environment variables', t => {
  t.plan(1);
  process.env.GITHUB_SECRET = 'my-secret';
  process.env.IFTTT_BASE_URL = 'http://localhost';
  process.env.IFTTT_KEY = 'my-key';
  process.env.MONGO_URI = 'mongodb+srv://';
  const actual = getConfig();
  const expected: Config = {
    githubSecret: 'my-secret',
    iftttBaseUrl: 'http://localhost',
    iftttKey: 'my-key',
    mongoDbUri: 'mongodb+srv://',
  };
  delete process.env.GITHUB_SECRET;
  delete process.env.IFTTT_BASE_URL;
  delete process.env.IFTTT_KEY;
  delete process.env.MONGO_URI;
  t.deepEqual(actual, expected);
});

test('initalize config object with defaults when env variables are not set', t => {
  t.plan(1);
  const actual = getConfig();
  const expected: Config = {
    githubSecret: '',
    iftttBaseUrl: 'https://maker.ifttt.com',
    iftttKey: '',
    mongoDbUri: '',
  };
  t.deepEqual(actual, expected);
});
