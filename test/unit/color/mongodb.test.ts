import test from 'ava';
import sinon from 'sinon';
import { Repository } from '../../../api/shared/mongodb';
import { updateDb } from '../../../api/color/mongodb';

function createMongoClient() {
  return {
    db: sinon.fake.returns({
      collection: sinon.fake.returns({
        findOneAndUpdate: sinon.fake(),
        find() {
          return {
            toArray: sinon.fake(),
          };
        },
      }),
    }),
    close: sinon.fake(),
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
  sinon.assert.calledWith(client.db, 'cibulb');
  t.pass();
});

test('use "repositories" collection', async t => {
  const client = createMongoClient();
  await updateDb(client as any, createRepository());
  sinon.assert.calledWith(client.db().collection, 'repositories');
  t.pass();
});

test('update DB with given repository', async t => {
  const repository = createRepository();
  const client = createMongoClient();
  await updateDb(client as any, repository);
  sinon.assert.calledWith(
    client.db().collection().findOneAndUpdate,
    { name: repository.name },
    { $set: { status: repository.status } },
    { upsert: true },
  );
  t.pass();
});
