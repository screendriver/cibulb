import { assert } from 'chai';
import { readGitlabToken } from '../../src/headers';

suite('headers', function () {
  test('readGitlabToken() returns an empty string when "x-gitlab-token" is not present', function () {
    const headers = {};
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, '');
  });

  test('readGitlabToken() returns "x-gitlab-token" from request headers', function () {
    const headers = {
      'x-gitlab-token': 'foo',
    };
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, 'foo');
  });
});
