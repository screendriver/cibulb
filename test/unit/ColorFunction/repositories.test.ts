import test from 'tape';
import {
  getRepositoriesState,
  Repository,
} from '../../../ColorFunction/repositories';

test('returns "success" when repositories are empty', t => {
  t.plan(1);
  const state = getRepositoriesState([]);
  t.equal(state, 'success');
});

test('returns "success" when all repositories are in state "success"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { state: 'success' },
    { state: 'success' },
  ];
  const state = getRepositoriesState(repositories);
  t.equal(state, 'success');
});

test('returns "pending" when one repository is in state "pending"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { state: 'success' },
    { state: 'error' },
    { state: 'pending' },
  ];
  const state = getRepositoriesState(repositories);
  t.equal(state, 'pending');
});

test('returns "error" when one repository is in state "error"', t => {
  t.plan(1);
  const repositories: Repository[] = [{ state: 'success' }, { state: 'error' }];
  const state = getRepositoriesState(repositories);
  t.equal(state, 'error');
});

test('returns "error" when one repository is in state "failure"', t => {
  t.plan(1);
  const repositories: Repository[] = [
    { state: 'success' },
    { state: 'failure' },
  ];
  const state = getRepositoriesState(repositories);
  t.equal(state, 'error');
});
