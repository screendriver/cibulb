import { IncomingMessage, ServerResponse } from 'http';
import verifySecret from 'verify-github-webhook-secret';
import { json } from 'micro';
import { MongoClient } from 'mongodb';
import got from 'got';
import { getConfig } from '../shared/config';
import { xHubSignature } from './headers';
import { isWebhookJsonBody, WebhookJsonBody } from './body';
import { isMasterBranch } from './branches';
import { callIftttWebhook } from '../shared/ifttt';
import { connect } from '../shared/mongodb';
import { updateDb } from './mongodb';
import { getRepositoriesState } from '../shared/repositories';

export default async function(req: IncomingMessage, res: ServerResponse) {
  const body = (await json(req)) as WebhookJsonBody;
  const bodyAsString = JSON.stringify(body);
  const config = getConfig();
  const signature = xHubSignature(req);
  console.info(`Called from repository ${body.name}`);
  const isSecretValid = await verifySecret(
    bodyAsString,
    config.githubSecret,
    signature,
  );
  if (!isSecretValid) {
    console.error('GitHub secret is not valid');
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }
  if (isWebhookJsonBody(body)) {
    if (isMasterBranch(body.branches)) {
      console.info('Calling MongoDB');
      const mongoClient = await connect(
        MongoClient,
        config.mongoDbUri,
      );
      const repositories = await updateDb(mongoClient, body);
      const overallState = getRepositoriesState(repositories);
      console.info(`Calling IFTTT webhook with "${overallState}" state`);
      const hookResponse = await callIftttWebhook(overallState, config, got);
      console.info(hookResponse);
      mongoClient.close();
    } else {
      console.info(
        `Called from "${body.branches
          .map(({ name }) => name)
          .toString()}" instead of "master" branch. Doing nothing.`,
      );
    }
  }
  res.statusCode = 204;
  res.end();
}
