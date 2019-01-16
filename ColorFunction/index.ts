import { Context, HttpRequest, AzureFunction } from '@azure/functions';
import verifySecret from 'verify-github-webhook-secret';
import got from 'got';
import { getConfig } from './config';
import { changeColor } from './color';

export const run: AzureFunction = async (
  context: Context,
  req: HttpRequest,
) => {
  const config = getConfig();
  const xHubSignature = req.headers['x-hub-signature'];
  return await changeColor(
    context.log,
    req.body,
    verifySecret,
    config.githubSecret,
    config.iftttBaseUrl,
    config.iftttKey,
    got,
    xHubSignature,
  );
};
