import { assert } from 'chai';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { readGitlabToken } from '../../src/headers';

type EventHeaders = APIGatewayProxyEvent['headers'];

function createHeaders(overrides: EventHeaders = {}): EventHeaders {
  return overrides;
}

suite('headers', function() {
  test('returns an empty string when headers is undefined', function() {
    const actual = readGitlabToken();
    assert.strictEqual(actual, '');
  });

  test('returns an empty string when "x-gitlab-token" is not present', function() {
    const headers = createHeaders();
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, '');
  });

  test('returns "x-gitlab-token" from request headers', function() {
    const headers = createHeaders({
      'x-gitlab-token': 'foo',
    });
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, 'foo');
  });
});
