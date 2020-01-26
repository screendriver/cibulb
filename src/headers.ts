import { APIGatewayProxyEvent } from 'aws-lambda';

export function readGitlabToken(
  headers?: APIGatewayProxyEvent['headers'],
): string {
  const signature = headers?.['X-Gitlab-Token'];
  if (typeof signature === 'string') {
    return signature;
  }
  return '';
}
