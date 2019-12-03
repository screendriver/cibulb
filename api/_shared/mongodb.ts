import { MongoClient } from 'mongodb';

export function connect(
  mongoClient: typeof MongoClient,
  mongoDbUri: string,
): Promise<MongoClient> {
  return mongoClient.connect(mongoDbUri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
}
