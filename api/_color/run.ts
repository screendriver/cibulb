import log from 'loglevel';
import { MongoClient } from 'mongodb';
import got from 'got';
import * as Sentry from '@sentry/node';
import { Config } from '../_shared/config';
import { isWebhookRequestBody, WebhookRequestBody } from './body';
import { isBranchAllowed } from './branches';
import { connect } from '../_shared/mongodb';
import { updateDb } from './mongodb';
import { getRepositoriesStatus, Repository } from '../_shared/repositories';
import { callIftttWebhook } from '../_shared/ifttt';

interface Result {
  statusCode: number;
  text?: string;
}

const noContentResult: Result = {
  statusCode: 204,
};

function wrongBranch(requestBody: WebhookRequestBody): Result {
  log.info(
    `Called from "${requestBody.object_attributes.ref}" instead of "master" branch. Doing nothing.`,
  );
  return noContentResult;
}

async function ifttt(
  requestBody: WebhookRequestBody,
  config: Config,
): Promise<Result> {
  const mongoClient = await connect(MongoClient, config.mongoDbUri);
  const repository: Repository = {
    name: requestBody.project.path_with_namespace,
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
  const message = 'GitLab secret is not valid';
  log.error(message);
  Sentry.captureMessage(message, Sentry.Severity.Error);
  return { statusCode: 403, text: 'Forbidden' };
}

export async function run(
  config: Config,
  requestBody: WebhookRequestBody,
  xGitlabToken: string,
): Promise<Result> {
  const { project } = requestBody;
  if (project) {
    log.info(`Called from repository ${project.path_with_namespace}`);
  }
  const isSecretValid = xGitlabToken === config.gitlabSecretToken;
  return !isSecretValid
    ? forbidden()
    : !isWebhookRequestBody(requestBody)
    ? noContentResult
    : isBranchAllowed(requestBody.object_attributes.ref)
    ? ifttt(requestBody, config)
    : wrongBranch(requestBody);
}
