import log from 'loglevel';
import verifySecret from 'verify-github-webhook-secret';
import { MongoClient } from 'mongodb';
import got from 'got';
import { getConfig, Config } from '../shared/config';
import { isWebhookJsonBody, WebhookJsonBody } from './body';
import { isMasterBranch } from './branches';
import { connect } from '../shared/mongodb';
import { updateDb } from './mongodb';
import { getRepositoriesState } from '../shared/repositories';
import { callIftttWebhook } from '../shared/ifttt';

interface Result {
  statusCode: number;
  text?: string;
}

const noContentResult: Result = {
  statusCode: 204,
};

export async function run(
  requestBody: WebhookJsonBody,
  xHubSignature: string,
): Promise<Result> {
  const config = getConfig();
  const bodyAsString = JSON.stringify(requestBody);
  log.info(`Called from repository ${requestBody.name}`);
  const isSecretValid = await verifySecret(
    bodyAsString,
    config.githubSecret,
    xHubSignature,
  );
  return !isSecretValid
    ? forbidden()
    : !isWebhookJsonBody(requestBody)
    ? noContentResult
    : isMasterBranch(requestBody.branches)
    ? ifttt(requestBody, config)
    : wrongBranch(requestBody);
}

function wrongBranch(requestBody: WebhookJsonBody): Result {
  log.info(
    `Called from "${requestBody.branches
      .map(({ name }) => name)
      .toString()}" instead of "master" branch. Doing nothing.`,
  );
  return noContentResult;
}

async function ifttt(
  requestBody: WebhookJsonBody,
  config: Config,
): Promise<Result> {
  log.info('Connect to MongoDB');
  const mongoClient = await connect(
    MongoClient,
    config.mongoDbUri,
  );
  const dbRepositories = await updateDb(mongoClient, requestBody);
  const dbRepositoriesState = getRepositoriesState(dbRepositories);
  log.info(`Calling IFTTT webhook with "${dbRepositoriesState}" state`);
  const hookResponse = await callIftttWebhook(dbRepositoriesState, config, got);
  log.info(hookResponse);
  mongoClient.close();
  return noContentResult;
}

function forbidden(): Result {
  log.error('GitHub secret is not valid');
  return { statusCode: 403, text: 'Forbidden' };
}
