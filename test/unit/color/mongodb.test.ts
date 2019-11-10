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

describe('mongodb', () => {
  it('use "cibulb" db', async () => {
    const client = createMongoClient();
    await updateDb(client as any, createRepository());
    sinon.assert.calledWith(client.db, 'cibulb');
  });

  it('use "repositories" collection', async () => {
    const client = createMongoClient();
    await updateDb(client as any, createRepository());
    sinon.assert.calledWith(client.db().collection, 'repositories');
  });

  it('update DB with given repository', async () => {
    const repository = createRepository();
    const client = createMongoClient();
    await updateDb(client as any, repository);
    sinon.assert.calledWith(
      client.db().collection().findOneAndUpdate,
      { name: repository.name },
      { $set: { status: repository.status } },
      { upsert: true },
    );
  });
});
