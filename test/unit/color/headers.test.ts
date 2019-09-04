import test from 'ava';
import { IncomingMessage } from 'http';
import { xGitlabToken } from '../../../api/color/headers';

test('returns "x-gitlab-token" from request headers', t => {
  const req: Partial<IncomingMessage> = {
    headers: {
      'x-gitlab-token': 'foo',
    },
  };
  const actual = xGitlabToken(req as IncomingMessage);
  t.is(actual, 'foo');
});

test('returns an empty string when "x-gitlab-token" is not present', t => {
  const req: Partial<IncomingMessage> = {
    headers: {},
  };
  const actual = xGitlabToken(req as IncomingMessage);
  t.is(actual, '');
});
