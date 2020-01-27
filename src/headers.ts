import { APIGatewayProxyEvent } from 'aws-lambda';

type APIGatewayProxyEventHeaders = APIGatewayProxyEvent['headers'];

function headersToLowercase(
  headers?: APIGatewayProxyEventHeaders,
): { [name: string]: string } {
  return Object.fromEntries(
    Object.entries(headers ?? {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  );
}

export function readGitlabToken(headers?: APIGatewayProxyEventHeaders): string {
  const lowercaseHeaders = headersToLowercase(headers);
  const signature = lowercaseHeaders['x-gitlab-token'];
  if (typeof signature === 'string') {
    return signature;
  }
  return '';
}
