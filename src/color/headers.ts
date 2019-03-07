import { IncomingMessage } from 'http';

export function xHubSignature(req: IncomingMessage): string {
  const signature = req.headers['x-hub-signature'];
  if (typeof signature === 'string') {
    return signature;
  }
  return '';
}
