import { expect } from 'chai';
import { isBranchAllowed } from '../../../api/color/branches';

suite('branches', function() {
  test('return true when branch is "master', function() {
    expect(isBranchAllowed('master')).to.be.true;
  });

  test('return true when branch is "refs/heads/master', function() {
    expect(isBranchAllowed('refs/heads/master')).to.be.true;
  });

  test('return true when branch is "develop', function() {
    expect(isBranchAllowed('develop')).to.be.true;
  });

  test('return true when branch is "refs/heads/develop', function() {
    expect(isBranchAllowed('refs/heads/develop')).to.be.true;
  });

  test('return false branch is "foo"', function() {
    expect(isBranchAllowed('foo')).to.be.false;
  });

  test('return false when branch is an empty string', function() {
    expect(isBranchAllowed('')).to.be.false;
  });
});
