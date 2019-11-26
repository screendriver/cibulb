import { NowRequest, NowResponse } from '@now/node';
import log from 'loglevel';
import * as Sentry from '@sentry/node';
import { MongoClient } from 'mongodb';
import got from 'got';
import { Server } from 'http';
import { getConfig } from './_shared/config';
import { initSentry } from './_shared/sentry';
import { startMongoDbMemoryServer, connect } from './_shared/mongodb';
import { allRepositories } from './_refresh/mongodb';
import { getRepositoriesStatus } from './_shared/repositories';
import { callIftttWebhook, startLocalIftttServer } from './_shared/ifttt';

log.enableAll();

export default async function refresh(_req: NowRequest, res: NowResponse) {
  let localIftttServer: Server | undefined;
  if (process.env.NODE_ENV === 'development') {
    process.env.MONGO_URI = await startMongoDbMemoryServer();
    localIftttServer = await startLocalIftttServer();
  }
  const config = getConfig();
  initSentry(Sentry, config, log);
  let mongoClient: MongoClient | undefined;
  try {
    mongoClient = await connect(MongoClient, config.mongoDbUri);
    log.info('Reading all repositories from MongoDB');
    const repositories = await allRepositories(mongoClient);
    const overallStatus = getRepositoriesStatus(repositories);
    log.info(`Calling IFTTT webhook with "${overallStatus}" status`);
    const hookResponse = await callIftttWebhook(overallStatus, config, got);
    log.info(hookResponse);
    res.statusCode = 200;
    res.send(hookResponse);
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    if (mongoClient) {
      mongoClient.close();
    }
    if (localIftttServer) {
      localIftttServer.close();
    }
  }
}
