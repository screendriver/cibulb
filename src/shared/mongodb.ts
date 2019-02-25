import { MongoClient } from 'mongodb';

export type RepositoryState = 'pending' | 'failure' | 'error' | 'success';

export interface Repository {
  name: string;
  state: RepositoryState;
}

export function connect(
  mongoClient: typeof MongoClient,
  mongoDbUri: string,
): Promise<MongoClient> {
  return mongoClient.connect(mongoDbUri, {
    useNewUrlParser: true,
  });
}
