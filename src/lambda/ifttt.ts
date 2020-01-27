import { SQSHandler } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import pPipe from 'p-pipe';
import gotLib from 'got';
import pino, { Logger } from 'pino';
import { getEndpoint } from '../endpoint';
import { getRepositoriesStatus, scanRepositories } from '../repositories';
import { triggerName, createIftttTrigger } from '../ifttt';

function logResponse(logger: Logger) {
  return (response: string) => {
    logger.info(response);
  };
}

export const handler: SQSHandler = () => {
  const logger = pino();
  const iftttKey = process.env.IFTTT_KEY ?? '';
  const iftttBaseUrl = process.env.IFTTT_BASE_URL ?? '';
  const dynamoDbTableName = process.env.DYNAMODB_TABLE_NAME ?? '';
  const docClient = new DocumentClient({ endpoint: getEndpoint(4569) });
  const iftttTrigger = pPipe(
    scanRepositories(docClient),
    getRepositoriesStatus,
    triggerName,
    createIftttTrigger(gotLib, iftttKey, iftttBaseUrl),
    logResponse(logger),
  );
  return iftttTrigger(dynamoDbTableName);
};
