import { IncomingMessage } from 'http';

export function xGitlabToken(req: IncomingMessage): string {
  const signature = req.headers['x-gitlab-token'];
  if (typeof signature === 'string') {
    return signature;
  }
  return '';
}
