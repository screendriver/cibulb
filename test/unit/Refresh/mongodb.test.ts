import test from 'tape';
import sinon from 'sinon';
import { Repository } from '../../../shared/mongodb';
import { allRepositories } from '../../../Refresh/mongodb';

test('return all found repositories', async t => {
  t.plan(1);
  const foundRepositories: Repository[] = [];
  const client = {
    db: sinon.stub().returns({
      collection: sinon.stub().returns({
        find: sinon.stub().returns({
          toArray() {
            return foundRepositories;
          },
        }),
      }),
    }),
  };
  const actual = await allRepositories(client as any);
  t.equal(actual, foundRepositories);
});
