import log from 'loglevel';
import { IncomingMessage, ServerResponse } from 'http';
import { json } from 'micro';
import { getConfig } from '../shared/config';
import { WebhookJsonBody } from './body';
import { xHubSignature } from './headers';
import { run } from './run';

log.enableAll();

export default async function(req: IncomingMessage, res: ServerResponse) {
  const config = getConfig();
  const body = (await json(req)) as WebhookJsonBody;
  const signature = xHubSignature(req);
  const result = await run(config, body, signature);
  res.statusCode = result.statusCode;
  res.end(result.text);
}
