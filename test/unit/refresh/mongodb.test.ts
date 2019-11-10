import { expect } from 'chai';
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

describe('mongodb', () => {
  it('use "cibulb" db', async () => {
    const client = createMongoClient();
    await allRepositories(client as any);
    sinon.assert.calledWith(client.db, 'cibulb');
  });

  it('use "repositories" collection', async () => {
    const client = createMongoClient();
    await allRepositories(client as any);
    sinon.assert.calledWith(client.db().collection, 'repositories');
  });

  it('return all found repositories', async () => {
    const foundRepositories: Repository[] = [];
    const client = createMongoClient(foundRepositories);
    const actual = await allRepositories(client as any);
    expect(actual).to.deep.equal(foundRepositories);
  });
});
