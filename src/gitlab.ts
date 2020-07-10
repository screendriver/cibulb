export function readGitLabTokenFromHeaders(
  headers: Record<string, string>,
): string {
  const signature = headers['x-gitlab-token'];
  if (typeof signature === 'string') {
    return signature;
  }
  return '';
}
