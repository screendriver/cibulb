import test from 'tape';
import { isBranchAllowed } from '../../../src/color/branches';

test('return true when "master" branch was found', t => {
  t.plan(1);
  const branches = [
    { name: 'featureA' },
    { name: 'master' },
    { name: 'featureB' },
  ];
  t.true(isBranchAllowed(branches));
});

test('return true when "develop" branch was found', t => {
  t.plan(1);
  const branches = [
    { name: 'featureA' },
    { name: 'develop' },
    { name: 'featureB' },
  ];
  t.true(isBranchAllowed(branches));
});

test('return true when "master" or "develop" branch was found', t => {
  t.plan(1);
  const branches = [
    { name: 'featureA' },
    { name: 'develop' },
    { name: 'master' },
  ];
  t.true(isBranchAllowed(branches));
});

test('return false when "master" or "develop" branch was not found', t => {
  t.plan(1);
  const branches = [{ name: 'featureA' }, { name: 'featureB' }];
  t.false(isBranchAllowed(branches));
});

test('return false when branches are empty', t => {
  t.plan(1);
  t.false(isBranchAllowed([]));
});
