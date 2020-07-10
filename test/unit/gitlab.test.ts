import { assert } from 'chai';
import { readGitLabTokenFromHeaders, isSecretValid } from '../../src/gitlab';

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

  test('isSecretValid() returns true when secret is valid', function () {
    const isValid = isSecretValid('my-secret', 'my-secret');
    assert.isTrue(isValid);
  });

  test('isSecretValid() returns false when secret is not valid', function () {
    const isValid = isSecretValid('my-secret', 'wrong-secret');
    assert.isFalse(isValid);
  });
});
