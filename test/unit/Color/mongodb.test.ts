import test from 'tape';
import sinon from 'sinon';
import { Repository } from '../../../shared/mongodb';
import { updateDb } from '../../../Color/mongodb';

function createMongoClient() {
  return {
    db: sinon.stub().returns({
      collection: sinon.stub().returns({
        findOneAndUpdate: sinon.stub(),
        find() {
          return {
            toArray: sinon.stub(),
          };
        },
      }),
    }),
    close: sinon.stub(),
  };
}

function createRepository(): Repository {
  return {
    name: 'test-repo',
    state: 'success',
  };
}

test('use "cibulb" db', async t => {
  t.plan(1);
  const client = createMongoClient();
  await updateDb(client as any, createRepository());
  t.true(client.db.calledWith('cibulb'));
});

test('use "repositories" collection', async t => {
  t.plan(1);
  const client = createMongoClient();
  await updateDb(client as any, createRepository());
  t.true(client.db().collection.calledWith('repositories'));
});

test('update DB with given repository', async t => {
  t.plan(1);
  const repository = createRepository();
  const client = createMongoClient();
  await updateDb(client as any, repository);
  t.true(
    client
      .db()
      .collection()
      .findOneAndUpdate.calledWith(
        { name: repository.name },
        { $set: { state: repository.state } },
        { upsert: true },
      ),
  );
});
