import { APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import pino, { Logger } from 'pino';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import SQS from 'aws-sdk/clients/sqs';
import { assertHasEventBody, parseEventBody, WebhookEventBody } from '../body';
import { readGitlabToken, readRequestTracing } from '../headers';
import { isBranchAllowed } from '../branch';
import { getEndpoint } from '../endpoint';
import { init, sentryHandler } from '../sentry';

function wrongBranch(
  eventBody: WebhookEventBody,
  logger: Logger,
): APIGatewayProxyResult {
  logger.info(
    `Called from "${eventBody.object_attributes.ref}" instead of main branch. Doing nothing.`,
  );
  return {
    statusCode: 204,
    body: 'No Content',
  };
}

async function putItemInDynamoDB(
  docClient: DocumentClient,
  dynamoDbTableName: string,
  eventBody: WebhookEventBody,
) {
  await docClient
    .put({
      TableName: dynamoDbTableName,
      Item: {
        Name: eventBody.project.path_with_namespace,
        RepoStatus: eventBody.object_attributes.status,
      },
    })
    .promise();
}

async function sendSqsMessage(
  eventBody: WebhookEventBody,
  docClient: DocumentClient,
  dynamoDbTableName: string,
  sqs: SQS,
  queueUrl: string,
  requestTracingId: string,
): Promise<APIGatewayProxyResult> {
  await putItemInDynamoDB(docClient, dynamoDbTableName, eventBody);
  await sqs
    .sendMessage({
      QueueUrl: queueUrl,
      MessageGroupId: 'IftttMessageGroup',
      MessageBody: `Call IFTTT - ${requestTracingId}`,
    })
    .promise();
  return { statusCode: 204, body: 'No Content' };
}

function forbidden(logger: Logger): APIGatewayProxyResult {
  const message = 'GitLab secret is not valid';
  logger.error(message);
  return { statusCode: 403, body: 'Forbidden' };
}

function isSecretValid(gitLabToken: string, gitLabSecretToken: string) {
  return gitLabToken === gitLabSecretToken;
}

function logRepositoryName(logger: Logger, eventBody: WebhookEventBody) {
  logger.info(
    `Called from repository ${eventBody.project.path_with_namespace}`,
  );
}

function verifyBranch(
  eventBody: WebhookEventBody,
  logger: Logger,
  docClient: DocumentClient,
  dynamoDbTableName: string,
  sqs: SQS,
  queueUrl: string,
  requestTracingId: string,
): APIGatewayProxyResult | Promise<APIGatewayProxyResult> {
  return isBranchAllowed(eventBody.object_attributes.ref)
    ? sendSqsMessage(
        eventBody,
        docClient,
        dynamoDbTableName,
        sqs,
        queueUrl,
        requestTracingId,
      )
    : wrongBranch(eventBody, logger);
}

interface RunDependencies {
  logger: Logger;
  gitLabToken: string;
  gitLabSecretToken: string;
  eventBody: WebhookEventBody;
  dynamoDbTableName: string;
  docClient: DocumentClient;
  sqs: SQS;
  queueUrl: string;
  requestTracingId: string;
}

function run({
  logger,
  gitLabToken,
  gitLabSecretToken,
  eventBody,
  docClient,
  dynamoDbTableName,
  sqs,
  queueUrl,
  requestTracingId,
}: RunDependencies): APIGatewayProxyResult | Promise<APIGatewayProxyResult> {
  return isSecretValid(gitLabToken, gitLabSecretToken)
    ? verifyBranch(
        eventBody,
        logger,
        docClient,
        dynamoDbTableName,
        sqs,
        queueUrl,
        requestTracingId,
      )
    : forbidden(logger);
}

init();

export const handler = sentryHandler<APIGatewayProxyHandler>(async (event) => {
  const { body, headers } = event;
  assertHasEventBody(body);
  const logger = pino();
  const eventBody = parseEventBody(body);
  logRepositoryName(logger, eventBody);
  const gitLabToken = readGitlabToken(headers);
  const requestTracingId = readRequestTracing(headers);
  const gitLabSecretToken = process.env.GITLAB_SECRET_TOKEN ?? '';
  const dynamoDbTableName = process.env.DYNAMODB_TABLE_NAME ?? '';
  const queueUrl = process.env.QUEUE_URL ?? '';
  const docClient = new DocumentClient({ endpoint: getEndpoint(4569) });
  const sqs = new SQS({ endpoint: getEndpoint(4576) });
  return Promise.resolve(
    run({
      gitLabToken,
      gitLabSecretToken,
      eventBody,
      logger,
      dynamoDbTableName,
      docClient,
      sqs,
      queueUrl,
      requestTracingId,
    }),
  );
});
