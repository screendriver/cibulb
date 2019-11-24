import { MongoClient } from 'mongodb';
import { Repository } from '../_shared/mongodb';

export async function updateDb(
  mongoClient: MongoClient,
  repository: Repository,
): Promise<readonly Repository[]> {
  const repositoriesCollection = mongoClient
    .db('cibulb')
    .collection<Repository>('repositories');
  await repositoriesCollection.findOneAndUpdate(
    { name: repository.name },
    { $set: { status: repository.status } },
    { upsert: true },
  );
  return await repositoriesCollection.find().toArray();
}
