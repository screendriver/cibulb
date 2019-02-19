import { MongoClient } from 'mongodb';
import { Config } from '../shared/config';
import { Repository, connect } from '../shared/mongodb';

export async function updateDb(
  mongoClient: typeof MongoClient,
  repository: Repository,
  config: Config,
): Promise<ReadonlyArray<Repository>> {
  const client = await connect(
    mongoClient,
    config.mongoDbUri,
  );
  try {
    const repositoriesCollection = client
      .db('cibulb')
      .collection<Repository>('repositories');
    await repositoriesCollection.findOneAndUpdate(
      { name: repository.name },
      { $set: { state: repository.state } },
      { upsert: true },
    );
    return await repositoriesCollection.find().toArray();
  } finally {
    client.close();
  }
}
