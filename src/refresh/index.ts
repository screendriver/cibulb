import log from 'loglevel';
import * as Sentry from '@sentry/node';
import { IncomingMessage, ServerResponse } from 'http';
import { MongoClient } from 'mongodb';
import got from 'got';
import { getConfig } from '../shared/config';
import { initSentry } from '../shared/sentry';
import { connect } from '../shared/mongodb';
import { allRepositories } from './mongodb';
import { getRepositoriesStatus } from '../shared/repositories';
import { callIftttWebhook } from '../shared/ifttt';

log.enableAll();

export = async function refresh(_req: IncomingMessage, res: ServerResponse) {
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
    res.end(hookResponse);
  } catch (e) {
    Sentry.captureException(e);
  }
};
