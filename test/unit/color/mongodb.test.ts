import { Repository } from '../../../api/shared/mongodb';
import { updateDb } from '../../../api/color/mongodb';

function createMongoClient() {
  return {
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOneAndUpdate: jest.fn(),
        find() {
          return {
            toArray: jest.fn(),
          };
        },
      }),
    }),
    close: jest.fn(),
  };
}

function createRepository(): Repository {
  return {
    name: 'test-repo',
    status: 'success',
  };
}

test('use "cibulb" db', async () => {
  const client = createMongoClient();
  await updateDb(client as any, createRepository());
  expect(client.db).toHaveBeenCalledWith('cibulb');
});

test('use "repositories" collection', async () => {
  const client = createMongoClient();
  await updateDb(client as any, createRepository());
  expect(client.db().collection).toHaveBeenCalledWith('repositories');
});

test('update DB with given repository', async () => {
  const repository = createRepository();
  const client = createMongoClient();
  await updateDb(client as any, repository);
  expect(client.db().collection().findOneAndUpdate).toHaveBeenCalledWith(
    { name: repository.name },
    { $set: { status: repository.status } },
    { upsert: true },
  );
});
