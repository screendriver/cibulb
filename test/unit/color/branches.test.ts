import test from 'tape';
import { isBranchAllowed } from '../../../src/color/branches';

test('return true when branch is "master', t => {
  t.plan(1);
  t.true(isBranchAllowed('master'));
});

test('return true when branch is "refs/heads/master', t => {
  t.plan(1);
  t.true(isBranchAllowed('refs/heads/master'));
});

test('return true when branch is "develop', t => {
  t.plan(1);
  t.true(isBranchAllowed('develop'));
});

test('return true when branch is "refs/heads/develop', t => {
  t.plan(1);
  t.true(isBranchAllowed('refs/heads/develop'));
});

test('return false branch is "foo"', t => {
  t.plan(1);
  t.false(isBranchAllowed('foo'));
});

test('return false when branch is an empty string', t => {
  t.plan(1);
  t.false(isBranchAllowed(''));
});
