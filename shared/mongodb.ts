import { MongoClient } from 'mongodb';

export interface Repository {
  name: string;
  state: 'pending' | 'failure' | 'error' | 'success';
}

export function connect(
  mongoClient: typeof MongoClient,
  mongoDbUri: string,
): Promise<MongoClient> {
  return mongoClient.connect(mongoDbUri, {
    useNewUrlParser: true,
  });
}
