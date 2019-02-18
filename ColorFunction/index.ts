import { Context, HttpRequest, AzureFunction } from '@azure/functions';
import verifySecret from 'verify-github-webhook-secret';
import { MongoClient } from 'mongodb';
import got from 'got';
import { getConfig } from '../shared/config';
import { xHubSignature } from './headers';
import { isWebhookJsonBody, WebhookJsonBody } from './body';
import { isMasterBranch } from './branches';
import { callIftttWebhook } from './ifttt';
import { updateDb } from './mongodb';
import { getRepositoriesState } from './repositories';

export const run: AzureFunction = async (
  context: Context,
  req: HttpRequest,
) => {
  const body: WebhookJsonBody = req.body;
  const bodyAsString = JSON.stringify(body);
  const config = getConfig();
  const signature = xHubSignature(req);
  context.log.info(`Called from repository ${body.name}`);
  const isSecretValid = await verifySecret(
    bodyAsString,
    config.githubSecret,
    signature,
  );
  if (!isSecretValid) {
    context.log.error('GitHub secret is not valid');
    return { status: 403, body: 'Forbidden' };
  }
  if (isWebhookJsonBody(body)) {
    if (isMasterBranch(body.branches)) {
      context.log.info('Calling MongoDB');
      const repositories = await updateDb(MongoClient, body, config);
      const overallState = getRepositoriesState(repositories);
      context.log.info(`Calling IFTTT webhook with "${overallState}" state`);
      const hookResponse = await callIftttWebhook(overallState, config, got);
      context.log.info(hookResponse);
    } else {
      context.log.info(
        `Called from "${body.branches
          .map(({ name }) => name)
          .toString()}" instead of "master" branch. Doing nothing.`,
      );
    }
  }
  return { status: 204, body: null };
};
