import test from 'tape';
import { IncomingMessage } from 'http';
import { xGitlabToken } from '../../../src/color/headers';

test('returns "x-gitlab-token" from request headers', t => {
  t.plan(1);
  const req: Partial<IncomingMessage> = {
    headers: {
      'x-gitlab-token': 'foo',
    },
  };
  const actual = xGitlabToken(req as IncomingMessage);
  t.equal(actual, 'foo');
});

test('returns an empty string when "x-gitlab-token" is not present', t => {
  t.plan(1);
  const req: Partial<IncomingMessage> = {
    headers: {},
  };
  const actual = xGitlabToken(req as IncomingMessage);
  t.equal(actual, '');
});
