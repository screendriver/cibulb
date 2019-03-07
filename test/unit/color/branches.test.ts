import test from 'tape';
import { isMasterBranch } from '../../../src/color/branches';

test('return true when "master" branch was found', t => {
  t.plan(1);
  const branches = [
    { name: 'featureA' },
    { name: 'master' },
    { name: 'featureB' },
  ];
  t.true(isMasterBranch(branches));
});

test('return false when "master" branch was not found', t => {
  t.plan(1);
  const branches = [{ name: 'featureA' }, { name: 'featureB' }];
  t.false(isMasterBranch(branches));
});

test('return false when branches are empty', t => {
  t.plan(1);
  t.false(isMasterBranch([]));
});
