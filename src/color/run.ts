import log from 'loglevel';
import verifySecret from 'verify-github-webhook-secret';
import { MongoClient } from 'mongodb';
import got from 'got';
import * as Sentry from '@sentry/node';
import { Config } from '../shared/config';
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
  config: Config,
  requestBody: WebhookJsonBody,
  xGitlabToken: string,
): Promise<Result> {
  const bodyAsString = JSON.stringify(requestBody);
  log.info(`Called from repository ${requestBody.name}`);
  const isSecretValid = await verifySecret(
    bodyAsString,
    config.gitlabSecretToken,
    xGitlabToken,
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
  const message = 'GitHub secret is not valid';
  log.error(message);
  Sentry.captureMessage(message, Sentry.Severity.Error);
  return { statusCode: 403, text: 'Forbidden' };
}
