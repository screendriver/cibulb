import * as functions from 'firebase-functions';

export const github = functions.https.onRequest((request, response) => {
  console.log(request);
  response.send(204);
});
