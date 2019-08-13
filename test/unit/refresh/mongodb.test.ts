import test from 'tape';
import sinon from 'sinon';
import { Repository } from '../../../api/shared/mongodb';
import { allRepositories } from '../../../api/refresh/mongodb';

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
  t.plan(1);
  const client = createMongoClient();
  await allRepositories(client as any);
  t.true(client.db.calledWith('cibulb'));
});

test('use "repositories" collection', async t => {
  t.plan(1);
  const client = createMongoClient();
  await allRepositories(client as any);
  t.true(client.db().collection.calledWith('repositories'));
});

test('return all found repositories', async t => {
  t.plan(1);
  const foundRepositories: Repository[] = [];
  const client = createMongoClient(foundRepositories);
  const actual = await allRepositories(client as any);
  t.equal(actual, foundRepositories);
});
