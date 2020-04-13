import { assert } from 'chai';
import { getEndpoint } from '../../src/endpoint';

suite('endpoint', function () {
  test('returns a local address when running on localstack', function () {
    process.env.LOCALSTACK_HOSTNAME = 'localhost';
    const actual = getEndpoint(1234);
    const expected = 'http://localhost:1234';
    assert.strictEqual(actual, expected);
    delete process.env.LOCALSTACK_HOSTNAME;
  });

  test('returns undefined when not running on localstack', function () {
    const actual = getEndpoint(1234);
    const expected = undefined;
    assert.strictEqual(actual, expected);
  });
});
