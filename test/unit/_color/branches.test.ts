import { assert } from 'chai';
import { isBranchAllowed } from '../../../api/_color/branches';

suite('branches', function() {
  test('return true when branch is "master', function() {
    assert.isTrue(isBranchAllowed('master'));
  });

  test('return true when branch is "refs/heads/master', function() {
    assert.isTrue(isBranchAllowed('refs/heads/master'));
  });

  test('return true when branch is "develop', function() {
    assert.isTrue(isBranchAllowed('develop'));
  });

  test('return true when branch is "refs/heads/develop', function() {
    assert.isTrue(isBranchAllowed('refs/heads/develop'));
  });

  test('return false branch is "foo"', function() {
    assert.isFalse(isBranchAllowed('foo'));
  });

  test('return false when branch is an empty string', function() {
    assert.isFalse(isBranchAllowed(''));
  });
});
