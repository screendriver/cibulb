import { assert } from 'chai';
import sinon from 'sinon';
import { Repository } from '../../../api/_shared/mongodb';
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

suite('mongodb', function() {
  test('use "cibulb" db', async function() {
    const client = createMongoClient();
    await allRepositories(client as any);
    sinon.assert.calledWith(client.db, 'cibulb');
  });

  test('use "repositories" collection', async function() {
    const client = createMongoClient();
    await allRepositories(client as any);
    sinon.assert.calledWith(client.db().collection, 'repositories');
  });

  test('return all found repositories', async function() {
    const foundRepositories: Repository[] = [];
    const client = createMongoClient(foundRepositories);
    const actual = await allRepositories(client as any);
    assert.equal(actual, foundRepositories);
  });
});
