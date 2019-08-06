import test from 'ava';
import sinon from 'sinon';
import { Repository } from '../../../src/shared/mongodb';
import { updateDb } from '../../../src/color/mongodb';

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
    status: 'success',
  };
}

test('use "cibulb" db', async t => {
  const client = createMongoClient();
  await updateDb(client as any, createRepository());
  t.true(client.db.calledWith('cibulb'));
});

test('use "repositories" collection', async t => {
  const client = createMongoClient();
  await updateDb(client as any, createRepository());
  t.true(client.db().collection.calledWith('repositories'));
});

test('update DB with given repository', async t => {
  const repository = createRepository();
  const client = createMongoClient();
  await updateDb(client as any, repository);
  t.true(
    client
      .db()
      .collection()
      .findOneAndUpdate.calledWith(
        { name: repository.name },
        { $set: { status: repository.status } },
        { upsert: true },
      ),
  );
});
