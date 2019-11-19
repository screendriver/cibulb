import { expect } from 'chai';
import { IncomingMessage } from 'http';
import { xGitlabToken } from '../../../api/color/headers';

suite('headers', function() {
  test('returns "x-gitlab-token" from request headers', function() {
    const req: Partial<IncomingMessage> = {
      headers: {
        'x-gitlab-token': 'foo',
      },
    };
    const actual = xGitlabToken(req as IncomingMessage);
    expect(actual).to.equal('foo');
  });

  test('returns an empty string when "x-gitlab-token" is not present', function() {
    const req: Partial<IncomingMessage> = {
      headers: {},
    };
    const actual = xGitlabToken(req as IncomingMessage);
    expect(actual).to.equal('');
  });
});
