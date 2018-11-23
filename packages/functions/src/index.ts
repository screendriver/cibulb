import * as functions from 'firebase-functions';

export const github = functions.https.onRequest((_request, response) => {
  response.send(204);
});
