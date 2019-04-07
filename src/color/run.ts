import log from 'loglevel';
import verifySecret from 'verify-github-webhook-secret';
import { MongoClient } from 'mongodb';
import got from 'got';
import * as Sentry from '@sentry/node';
import { Config } from '../shared/config';
import { isWebhookRequestBody, WebhookRequestBody } from './body';
import { isBranchAllowed } from './branches';
import { connect, Repository } from '../shared/mongodb';
import { updateDb } from './mongodb';
import { getRepositoriesStatus } from '../shared/repositories';
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
  requestBody: WebhookRequestBody,
  xGitlabToken: string,
): Promise<Result> {
  log.info('xGitlabToken', xGitlabToken);
  log.info('requestBody', requestBody);
  const bodyAsString = JSON.stringify(requestBody);
  log.info(`Called from repository ${requestBody.project.name}`);
  const isSecretValid = await verifySecret(
    bodyAsString,
    config.gitlabSecretToken,
    xGitlabToken,
  );
  return !isSecretValid
    ? forbidden()
    : !isWebhookRequestBody(requestBody)
    ? noContentResult
    : isBranchAllowed(requestBody.branches)
    ? ifttt(requestBody, config)
    : wrongBranch(requestBody);
}

function wrongBranch(requestBody: WebhookRequestBody): Result {
  log.info(
    `Called from "${
      requestBody.object_attributes.ref
    }" instead of "master" branch. Doing nothing.`,
  );
  return noContentResult;
}

async function ifttt(
  requestBody: WebhookRequestBody,
  config: Config,
): Promise<Result> {
  const mongoClient = await connect(
    MongoClient,
    config.mongoDbUri,
  );
  const repository: Repository = {
    name: requestBody.project.name,
    status: requestBody.object_attributes.status,
  };
  const dbRepositories = await updateDb(mongoClient, repository);
  const dbRepositoriesStatus = getRepositoriesStatus(dbRepositories);
  log.info(`Calling IFTTT webhook with "${dbRepositoriesStatus}" status`);
  const hookResponse = await callIftttWebhook(
    dbRepositoriesStatus,
    config,
    got,
  );
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
