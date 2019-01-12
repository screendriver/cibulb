import test from 'tape';
import { getConfig, Config } from '../../ColorFunction/config';

test('create config object', t => {
  t.plan(1);
  process.env.GITHUB_SECRET = 'my-secret';
  process.env.IFTTT_BASE_URL = 'https://maker.ifttt.com';
  process.env.IFTTT_KEY = 'my-key';
  const actual = getConfig();
  const expected: Config = {
    githubSecret: 'my-secret',
    iftttBaseUrl: 'https://maker.ifttt.com',
    iftttKey: 'my-key',
  };
  delete process.env.GITHUB_SECRET;
  delete process.env.IFTTT_BASE_URL;
  delete process.env.IFTTT_KEY;
  t.deepEqual(actual, expected);
});

test('initalize config object with empty strings when env variables are not set', t => {
  t.plan(1);
  const actual = getConfig();
  const expected: Config = {
    githubSecret: '',
    iftttBaseUrl: '',
    iftttKey: '',
  };
  t.deepEqual(actual, expected);
});
