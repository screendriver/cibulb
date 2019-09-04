import test from 'ava';
import { isBranchAllowed } from '../../../api/color/branches';

test('return true when branch is "master', t => {
  t.is(isBranchAllowed('master'), true);
});

test('return true when branch is "refs/heads/master', t => {
  t.is(isBranchAllowed('refs/heads/master'), true);
});

test('return true when branch is "develop', t => {
  t.is(isBranchAllowed('develop'), true);
});

test('return true when branch is "refs/heads/develop', t => {
  t.is(isBranchAllowed('refs/heads/develop'), true);
});

test('return false branch is "foo"', t => {
  t.is(isBranchAllowed('foo'), false);
});

test('return false when branch is an empty string', t => {
  t.is(isBranchAllowed(''), false);
});
