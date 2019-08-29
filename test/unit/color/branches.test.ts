import { isBranchAllowed } from '../../../api/color/branches';

test('return true when branch is "master', () => {
  expect(isBranchAllowed('master')).toBe(true);
});

test('return true when branch is "refs/heads/master', () => {
  expect(isBranchAllowed('refs/heads/master')).toBe(true);
});

test('return true when branch is "develop', () => {
  expect(isBranchAllowed('develop')).toBe(true);
});

test('return true when branch is "refs/heads/develop', () => {
  expect(isBranchAllowed('refs/heads/develop')).toBe(true);
});

test('return false branch is "foo"', () => {
  expect(isBranchAllowed('foo')).toBe(false);
});

test('return false when branch is an empty string', () => {
  expect(isBranchAllowed('')).toBe(false);
});
