import { MongoClient } from 'mongodb';
import { Repository } from '../shared/mongodb';

export async function allRepositories(
  mongoClient: MongoClient,
): Promise<readonly Repository[]> {
  return mongoClient
    .db('cibulb')
    .collection<Repository>('repositories')
    .find()
    .toArray();
}
