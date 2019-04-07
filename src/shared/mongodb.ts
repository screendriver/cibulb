import { MongoClient } from 'mongodb';

export type RepositoryStatus = 'pending' | 'failure' | 'error' | 'success';

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
