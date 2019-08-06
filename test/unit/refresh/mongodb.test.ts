import test from 'ava';
import sinon from 'sinon';
import { Repository } from '../../../src/shared/mongodb';
import { allRepositories } from '../../../src/refresh/mongodb';

function createMongoClient(repositoriesToReturn: Repository[] = []) {
  return {
    db: sinon.stub().returns({
      collection: sinon.stub().returns({
        find: sinon.stub().returns({
          toArray() {
            return repositoriesToReturn;
          },
        }),
      }),
    }),
  };
}

test('use "cibulb" db', async t => {
  const client = createMongoClient();
  await allRepositories(client as any);
  t.true(client.db.calledWith('cibulb'));
});

test('use "repositories" collection', async t => {
  const client = createMongoClient();
  await allRepositories(client as any);
  t.true(client.db().collection.calledWith('repositories'));
});

test('return all found repositories', async t => {
  const foundRepositories: Repository[] = [];
  const client = createMongoClient(foundRepositories);
  const actual = await allRepositories(client as any);
  t.deepEqual(actual, foundRepositories);
});
