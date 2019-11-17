import { expect } from 'chai';
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

suite('mongodb', () => {
  test('use "cibulb" db', async () => {
    const client = createMongoClient();
    await updateDb(client as any, createRepository());
    expect(client.db).to.have.been.calledWith('cibulb');
  });

  test('use "repositories" collection', async () => {
    const client = createMongoClient();
    await updateDb(client as any, createRepository());
    expect(client.db().collection).to.have.been.calledWith('repositories');
  });

  test('update DB with given repository', async () => {
    const repository = createRepository();
    const client = createMongoClient();
    await updateDb(client as any, repository);
    expect(client.db().collection().findOneAndUpdate).to.have.been.calledWith(
      { name: repository.name },
      { $set: { status: repository.status } },
      { upsert: true },
    );
  });
});
