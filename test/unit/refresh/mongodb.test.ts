import { Repository } from '../../../api/shared/mongodb';
import { allRepositories } from '../../../api/refresh/mongodb';

function createMongoClient(repositoriesToReturn: Repository[] = []) {
  return {
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn().mockReturnValue({
          toArray() {
            return repositoriesToReturn;
          },
        }),
      }),
    }),
  };
}

test('use "cibulb" db', async () => {
  const client = createMongoClient();
  await allRepositories(client as any);
  expect(client.db).toHaveBeenCalledWith('cibulb');
});

test('use "repositories" collection', async () => {
  const client = createMongoClient();
  await allRepositories(client as any);
  expect(client.db().collection).toHaveBeenCalledWith('repositories');
});

test('return all found repositories', async () => {
  const foundRepositories: Repository[] = [];
  const client = createMongoClient(foundRepositories);
  const actual = await allRepositories(client as any);
  expect(actual).toEqual(foundRepositories);
});
