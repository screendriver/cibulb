import verifySecret from 'verify-github-webhook-secret';
import { MongoClient } from 'mongodb';
import got from 'got';
import { getConfig } from '../shared/config';
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
export async function run(
  requestBody: WebhookJsonBody,
  xHubSignature: string,
): Promise<Result> {
  const config = getConfig();
  const bodyAsString = JSON.stringify(requestBody);
  console.info(`Called from repository ${requestBody.name}`);
  const isSecretValid = await verifySecret(
    bodyAsString,
    config.githubSecret,
    xHubSignature,
  );
  if (!isSecretValid) {
    console.error('GitHub secret is not valid');
    return { statusCode: 403, text: 'Forbidden' };
  }
  if (isWebhookJsonBody(requestBody)) {
    if (isMasterBranch(requestBody.branches)) {
      console.info('Calling MongoDB');
      const mongoClient = await connect(
        MongoClient,
        config.mongoDbUri,
      );
      const repositories = await updateDb(mongoClient, requestBody);
      const overallState = getRepositoriesState(repositories);
      console.info(`Calling IFTTT webhook with "${overallState}" state`);
      const hookResponse = await callIftttWebhook(overallState, config, got);
      console.info(hookResponse);
      mongoClient.close();
    } else {
      console.info(
        `Called from "${requestBody.branches
          .map(({ name }) => name)
          .toString()}" instead of "master" branch. Doing nothing.`,
      );
    }
  }
  return { statusCode: 204 };
}
