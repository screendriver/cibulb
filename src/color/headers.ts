import { HttpRequest } from '@azure/functions';

export function xHubSignature(req: HttpRequest): string {
  return req.headers['x-hub-signature'];
}
