import { assert } from 'chai';
import { isBranchAllowed } from '../../src/branch';

suite('branch', function () {
  test('return true when branch is "master', function () {
    assert.isTrue(isBranchAllowed('master'));
  });

  test('return true when branch is "refs/heads/master', function () {
    assert.isTrue(isBranchAllowed('refs/heads/master'));
  });

  test('return true when branch is "develop', function () {
    assert.isTrue(isBranchAllowed('develop'));
  });

  test('return true when branch is "refs/heads/develop', function () {
    assert.isTrue(isBranchAllowed('refs/heads/develop'));
  });

  test('return false when branch is "foo"', function () {
    assert.isFalse(isBranchAllowed('foo'));
  });

  test('return false when branch is an empty string', function () {
    assert.isFalse(isBranchAllowed(''));
  });
});
