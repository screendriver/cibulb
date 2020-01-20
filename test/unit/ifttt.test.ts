import { assert } from 'chai';
import sinon from 'sinon';
import { Got } from 'got';
import { triggerName, createIftttTrigger } from '../../src/ifttt';
import { RepositoriesStatus } from '../../src/repositories';

suite('ifttt', function() {
  test('triggerName() gets correct name for "success" message', function() {
    const actual = triggerName('success');
    const expected = 'ci_build_success';
    assert.strictEqual(actual, expected);
  });

  test('triggerName() gets correct name for "pending" message', function() {
    const actual = triggerName('pending');
    const expected = 'ci_build_pending';
    assert.strictEqual(actual, expected);
  });

  test('triggerName() gets correct name for "failed" message', function() {
    const actual = triggerName('failed');
    const expected = 'ci_build_failure';
    assert.strictEqual(actual, expected);
  });

  test('triggerName() gets correct name for unknown message', function() {
    const actual = triggerName(('unknown' as unknown) as RepositoriesStatus);
    const expected = 'ci_build_failure';
    assert.strictEqual(actual, expected);
  });

  test('createIftttTrigger() calls the right IFTTT URL', async function() {
    const got = sinon.fake.resolves('');
    const iftttKey = 'my-key';
    const iftttBaseUrl = 'http://example.com';
    const trigger = createIftttTrigger(
      (got as unknown) as Got,
      iftttKey,
      iftttBaseUrl,
    );
    await trigger('do_it');
    sinon.assert.calledWith(got, `trigger/do_it/with/key/my-key`, {
      prefixUrl: iftttBaseUrl,
      resolveBodyOnly: true,
    });
  });
});
