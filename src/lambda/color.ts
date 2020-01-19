import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import pino, { Logger } from 'pino';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import SNS from 'aws-sdk/clients/sns';
import { assertHasEventBody, parseEventBody, WebhookEventBody } from '../body';
import { readGitlabToken } from '../headers';
import { isBranchAllowed } from '../branch';
import { getEndpoint } from '../endpoint';
import { getRepositoriesStatus } from '../repositories';

function wrongBranch(
  eventBody: WebhookEventBody,
  logger: Logger,
): APIGatewayProxyResult {
  logger.info(
    `Called from "${eventBody.object_attributes.ref}" instead of "master" branch. Doing nothing.`,
  );
  return {
    statusCode: 204,
    body: 'No Content',
  };
}

async function callIfttt(
  eventBody: WebhookEventBody,
  docClient: DocumentClient,
  dynamoDbTableName: string,
  sns: SNS,
  snsTopicArn: string,
): Promise<APIGatewayProxyResult> {
  await docClient
    .put({
      TableName: dynamoDbTableName,
      Item: {
        Name: eventBody.project.path_with_namespace,
        Status: eventBody.object_attributes.status,
      },
    })
    .promise();
  const { Items } = await docClient
    .scan({ TableName: dynamoDbTableName, ProjectionExpression: 'Status' })
    .promise();
  const overallStatus = getRepositoriesStatus(Items);
  await sns
    .publish({ TopicArn: snsTopicArn, Message: overallStatus })
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
  sns: SNS,
  snsTopicArn: string,
): APIGatewayProxyResult | Promise<APIGatewayProxyResult> {
  return isBranchAllowed(eventBody.object_attributes.ref)
    ? callIfttt(eventBody, docClient, dynamoDbTableName, sns, snsTopicArn)
    : wrongBranch(eventBody, logger);
}

interface RunDependencies {
  logger: Logger;
  gitLabToken: string;
  gitLabSecretToken: string;
  eventBody: WebhookEventBody;
  dynamoDbTableName: string;
  snsTopicArn: string;
  docClient: DocumentClient;
  sns: SNS;
}

function run({
  logger,
  gitLabToken,
  gitLabSecretToken,
  eventBody,
  docClient,
  dynamoDbTableName,
  sns,
  snsTopicArn,
}: RunDependencies): APIGatewayProxyResult | Promise<APIGatewayProxyResult> {
  return isSecretValid(gitLabToken, gitLabSecretToken)
    ? verifyBranch(
        eventBody,
        logger,
        docClient,
        dynamoDbTableName,
        sns,
        snsTopicArn,
      )
    : forbidden(logger);
}

export const handler: APIGatewayProxyHandler = event => {
  const { body, headers } = event;
  assertHasEventBody(body);
  const logger = pino();
  const eventBody = parseEventBody(body);
  logRepositoryName(logger, eventBody);
  const gitLabToken = readGitlabToken(headers);
  const gitLabSecretToken = process.env.GITLAB_SECRET_TOKEN ?? '';
  const dynamoDbTableName = process.env.DYNAMODB_TABLE_NAME ?? '';
  const snsTopicArn = process.env.TOPIC_ARN ?? '';
  const docClient = new DocumentClient({ endpoint: getEndpoint(4569) });
  const sns = new SNS({ endpoint: getEndpoint(4575) });
  return Promise.resolve(
    run({
      gitLabToken,
      gitLabSecretToken,
      eventBody,
      logger,
      dynamoDbTableName,
      snsTopicArn,
      docClient,
      sns,
    }),
  );
};
