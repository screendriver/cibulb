import { MongoClient } from 'mongodb';
import { Status } from './repositories';

export interface Repository {
  name: string;
  status: Status;
}

export async function startMongoDbMemoryServer(): Promise<string> {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  return new MongoMemoryServer().getConnectionString();
}

export function connect(
  mongoClient: typeof MongoClient,
  mongoDbUri: string,
): Promise<MongoClient> {
  return mongoClient.connect(mongoDbUri, {
    useNewUrlParser: true,
  });
}
