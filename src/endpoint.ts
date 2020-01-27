export function getEndpoint(port: number): string | undefined {
  return process.env.LOCALSTACK_HOSTNAME
    ? `http://${process.env.LOCALSTACK_HOSTNAME}:${port}`
    : undefined;
}
