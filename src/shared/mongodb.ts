import { MongoClient } from 'mongodb';
import { Status } from './repositories';

export interface Repository {
  name: string;
  status: Status;
}

export function connect(
  mongoClient: typeof MongoClient,
  mongoDbUri: string,
): Promise<MongoClient> {
  return mongoClient.connect(mongoDbUri, {
    useNewUrlParser: true,
  });
}
