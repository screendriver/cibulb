import { NowRequest, NowResponse } from '@now/node';
import log from 'loglevel';
import * as Sentry from '@sentry/node';
import { MongoClient } from 'mongodb';
import got from 'got';
import { getConfig } from './shared/config';
import { initSentry } from './shared/sentry';
import { startMongoDbMemoryServer, connect } from './shared/mongodb';
import { allRepositories } from './refresh/mongodb';
import { getRepositoriesStatus } from './shared/repositories';
import { callIftttWebhook } from './shared/ifttt';

log.enableAll();

export default async function refresh(_req: NowRequest, res: NowResponse) {
  if (process.env.NODE_ENV === 'development') {
    process.env.MONGO_URI = await startMongoDbMemoryServer();
  }
  const config = getConfig();
  initSentry(Sentry, config, log);
  try {
    const mongoClient = await connect(
      MongoClient,
      config.mongoDbUri,
    );
    log.info('Reading all repositories from MongoDB');
    const repositories = await allRepositories(mongoClient);
    const overallStatus = getRepositoriesStatus(repositories);
    log.info(`Calling IFTTT webhook with "${overallStatus}" status`);
    const hookResponse = await callIftttWebhook(overallStatus, config, got);
    log.info(hookResponse);
    mongoClient.close();
    res.statusCode = 200;
    res.send(hookResponse);
  } catch (e) {
    Sentry.captureException(e);
  }
}
