import { MongoClient } from 'mongodb';
import { WebhookJsonBody } from './body';
import { Config } from './config';

export type Repository = Pick<WebhookJsonBody, 'name' | 'state'>;

export async function updateDb(
  repository: Repository,
  config: Config,
): Promise<ReadonlyArray<Repository>> {
  const client = await MongoClient.connect(config.mongoDbUri, {
    useNewUrlParser: true,
  });
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
