import { APIGatewayProxyEvent } from 'aws-lambda';

export function readGitlabToken(
  headers?: APIGatewayProxyEvent['headers'],
): string {
  const signature = headers?.['x-gitlab-token'];
  if (typeof signature === 'string') {
    return signature;
  }
  return '';
}
