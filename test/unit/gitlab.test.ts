import { assert } from 'chai';
import { readGitLabTokenFromHeaders } from '../../src/gitlab';

suite('gitlab', function () {
  test('readGitLabTokenFromHeaders() returns an empty string when "x-gitlab-token" is not present', function () {
    const headers = {};
    const actual = readGitLabTokenFromHeaders(headers);
    assert.strictEqual(actual, '');
  });

  test('readGitLabTokenFromHeaders() returns "x-gitlab-token" from request headers', function () {
    const headers = {
      'x-gitlab-token': 'foo',
    };
    const actual = readGitLabTokenFromHeaders(headers);
    assert.strictEqual(actual, 'foo');
  });
});
