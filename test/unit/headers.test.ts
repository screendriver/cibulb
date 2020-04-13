import { assert } from 'chai';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { readGitlabToken, readRequestTracing } from '../../src/headers';

type EventHeaders = APIGatewayProxyEvent['headers'];

function createHeaders(overrides: EventHeaders = {}): EventHeaders {
  return overrides;
}

suite('headers', function () {
  test('readGitlabToken() returns an empty string when headers is undefined', function () {
    const actual = readGitlabToken();
    assert.strictEqual(actual, '');
  });

  test('readGitlabToken() returns an empty string when headers are undefined', function () {
    const headers = undefined;
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, '');
  });

  test('readGitlabToken() returns an empty string when "x-gitlab-token" is not present', function () {
    const headers = createHeaders();
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, '');
  });

  test('readGitlabToken() returns "x-gitlab-token" from request headers', function () {
    const headers = createHeaders({
      'x-gitlab-token': 'foo',
    });
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, 'foo');
  });

  test('readGitlabToken() works also with case sensitive headers', function () {
    const headers = createHeaders({
      'X-Gitlab-Token': 'foo',
    });
    const actual = readGitlabToken(headers);
    assert.strictEqual(actual, 'foo');
  });

  test('readRequestTracing() returns an empty string when headers is undefined', function () {
    const actual = readRequestTracing();
    assert.strictEqual(actual, '');
  });

  test('readRequestTracing() returns an empty string when headers are undefined', function () {
    const headers = undefined;
    const actual = readRequestTracing(headers);
    assert.strictEqual(actual, '');
  });

  test('readRequestTracing() returns an empty string when "x-amzn-trace-id" is not present', function () {
    const headers = createHeaders();
    const actual = readRequestTracing(headers);
    assert.strictEqual(actual, '');
  });

  test('readRequestTracing() returns "x-amzn-trace-id" from request headers', function () {
    const headers = createHeaders({
      'x-amzn-trace-id': 'foo',
    });
    const actual = readRequestTracing(headers);
    assert.strictEqual(actual, 'foo');
  });

  test('readRequestTracing() works also with case sensitive headers', function () {
    const headers = createHeaders({
      'X-Amzn-Trace-Id': 'foo',
    });
    const actual = readRequestTracing(headers);
    assert.strictEqual(actual, 'foo');
  });
});
