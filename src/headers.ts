import { APIGatewayProxyEvent } from 'aws-lambda';
import flow from 'lodash.flow';

type APIGatewayProxyEventHeaders = APIGatewayProxyEvent['headers'];
type Headers = { [name: string]: string };

function headersToLowercase(headers?: APIGatewayProxyEventHeaders): Headers {
  return Object.fromEntries(
    Object.entries(headers ?? {}).map(([key, value]) => [
      key.toLowerCase(),
      value,
    ]),
  );
}

function createReadHeader(name: string) {
  return (headers: Headers) => {
    const signature = headers[name];
    if (typeof signature === 'string') {
      return signature;
    }
    return '';
  };
}

export function readGitlabToken(headers?: APIGatewayProxyEventHeaders): string {
  return flow(headersToLowercase, createReadHeader('x-gitlab-token'))(headers);
}

export function readRequestTracing(
  headers?: APIGatewayProxyEventHeaders,
): string {
  return flow(headersToLowercase, createReadHeader('x-amzn-trace-id'))(headers);
}
