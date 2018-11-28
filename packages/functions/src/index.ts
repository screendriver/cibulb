import * as functions from 'firebase-functions';
import { Logger, LogLevel } from '@firebase/logger';

const logger = new Logger('github');
logger.logLevel = LogLevel.DEBUG;

export const github = functions.https.onRequest((request, response) => {
  logger.log(`Incoming ${request.method} request`);
  response.send(204);
});
