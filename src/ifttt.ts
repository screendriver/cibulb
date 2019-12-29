import { SNSHandler } from 'aws-lambda';
import got from 'got';

function triggerName(message: string) {
  switch (message) {
    case 'success':
      return 'ci_build_success';
    case 'pending':
      return 'ci_build_pending';
    case 'failed':
    default:
      return 'ci_build_failure';
  }
}

export const handler: SNSHandler = async event => {
  const iftttKey = process.env.IFTTT_KEY ?? '';
  const iftttBaseUrl = process.env.IFTTT_BASE_URL ?? '';
  const message = event.Records.reduce(
    (_previousValue, currentValue) => currentValue.Sns.Message,
    '',
  );
  await got(`trigger/${triggerName(message)}/with/key/${iftttKey}`, {
    prefixUrl: iftttBaseUrl,
  });
};
