import test from 'ava';
import sinon from 'sinon';
import { Repository } from '../../../api/shared/mongodb';
import { allRepositories } from '../../../api/refresh/mongodb';

function createMongoClient(repositoriesToReturn: Repository[] = []) {
  return {
    db: sinon.fake.returns({
      collection: sinon.fake.returns({
        find: sinon.fake.returns({
          toArray: sinon.fake.resolves(repositoriesToReturn),
        }),
      }),
    }),
  };
}

test('use "cibulb" db', async t => {
  const client = createMongoClient();
  await allRepositories(client as any);
  sinon.assert.calledWith(client.db, 'cibulb');
  t.pass();
});

test('use "repositories" collection', async t => {
  const client = createMongoClient();
  await allRepositories(client as any);
  sinon.assert.calledWith(client.db().collection, 'repositories');
  t.pass();
});

test('return all found repositories', async t => {
  const foundRepositories: Repository[] = [];
  const client = createMongoClient(foundRepositories);
  const actual = await allRepositories(client as any);
  t.deepEqual(actual, foundRepositories);
});
