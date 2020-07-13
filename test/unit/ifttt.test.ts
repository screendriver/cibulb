import { assert } from 'chai';
import { mapStatusToTriggerName } from '../../src/ifttt';

suite('ifttt', function () {
  test('mapStatusToTriggerName() maps "success" to "ci_build_success"', function () {
    const actual = mapStatusToTriggerName('success');
    const expected = 'ci_build_success';
    assert.equal(actual, expected);
  });

  test('mapStatusToTriggerName() maps "pending" to "ci_build_pending"', function () {
    const actual = mapStatusToTriggerName('pending');
    const expected = 'ci_build_pending';
    assert.equal(actual, expected);
  });

  test('mapStatusToTriggerName() maps "failed" to "ci_build_failure"', function () {
    const actual = mapStatusToTriggerName('failed');
    const expected = 'ci_build_failure';
    assert.equal(actual, expected);
  });
});
