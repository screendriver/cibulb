import { IncomingMessage } from 'http';
import { xGitlabToken } from '../../../api/color/headers';

test('returns "x-gitlab-token" from request headers', () => {
  const req: Partial<IncomingMessage> = {
    headers: {
      'x-gitlab-token': 'foo',
    },
  };
  const actual = xGitlabToken(req as IncomingMessage);
  expect(actual).toBe('foo');
});

test('returns an empty string when "x-gitlab-token" is not present', () => {
  const req: Partial<IncomingMessage> = {
    headers: {},
  };
  const actual = xGitlabToken(req as IncomingMessage);
  expect(actual).toBe('');
});
