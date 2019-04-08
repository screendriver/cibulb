import { MongoClient } from 'mongodb';

export type RepositoryStatus = 'success' | 'running' | 'pending' | 'failed';

export interface Repository {
  name: string;
  status: RepositoryStatus;
}

export function connect(
  mongoClient: typeof MongoClient,
  mongoDbUri: string,
): Promise<MongoClient> {
  return mongoClient.connect(mongoDbUri, {
    useNewUrlParser: true,
  });
}
