import { AzureFunction, Context } from '@azure/functions';
import { MongoClient } from 'mongodb';
import got from 'got';
import { getConfig } from '../shared/config';
import { connect } from '../shared/mongodb';
import { allRepositories } from './mongodb';
import { getRepositoriesState } from '../shared/repositories';
import { callIftttWebhook } from '../shared/ifttt';

export const run: AzureFunction = async (context: Context) => {
  const config = getConfig();
  const mongoClient = await connect(
    MongoClient,
    config.mongoDbUri,
  );
  context.log.info('Reading all repositories from MongoDB');
  const repositories = await allRepositories(mongoClient);
  const overallState = getRepositoriesState(repositories);
  context.log.info(`Calling IFTTT webhook with "${overallState}" state`);
  const hookResponse = await callIftttWebhook(overallState, config, got);
  context.log.info(hookResponse);
  mongoClient.close();
  return { status: 204, body: null };
};
