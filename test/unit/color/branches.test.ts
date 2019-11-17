import { expect } from 'chai';
import { isBranchAllowed } from '../../../api/color/branches';

suite('branches', () => {
  test('return true when branch is "master', () => {
    expect(isBranchAllowed('master')).to.be.true;
  });

  test('return true when branch is "refs/heads/master', () => {
    expect(isBranchAllowed('refs/heads/master')).to.be.true;
  });

  test('return true when branch is "develop', () => {
    expect(isBranchAllowed('develop')).to.be.true;
  });

  test('return true when branch is "refs/heads/develop', () => {
    expect(isBranchAllowed('refs/heads/develop')).to.be.true;
  });

  test('return false branch is "foo"', () => {
    expect(isBranchAllowed('foo')).to.be.false;
  });

  test('return false when branch is an empty string', () => {
    expect(isBranchAllowed('')).to.be.false;
  });
});
