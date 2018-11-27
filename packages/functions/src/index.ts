import * as functions from 'firebase-functions';
import { Logger } from '@firebase/logger';

const logger = new Logger('@firebase/cibulb-functions');

export const github = functions.https.onRequest((request, response) => {
  logger.log(request);
  response.send(204);
});
