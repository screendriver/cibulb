import { SNSHandler, SNSEventRecord } from 'aws-lambda';
import flow from 'lodash.flow';
import gotLib, { Got } from 'got';
import log from 'loglevel';

log.enableAll();

export function triggerName(message: string) {
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

export function firstMessage(records: SNSEventRecord[]): string {
  const [message] = records.map(record => record.Sns.Message);
  return message ?? '';
}

export function createIftttTrigger(trigger: string) {
  return async (got: Got, iftttKey: string, iftttBaseUrl: string) => {
    const response = await got(`trigger/${trigger}/with/key/${iftttKey}`, {
      prefixUrl: iftttBaseUrl,
      resolveBodyOnly: true,
    });
    log.info(response);
  };
}

export const handler: SNSHandler = async event => {
  const iftttKey = process.env.IFTTT_KEY ?? '';
  const iftttBaseUrl = process.env.IFTTT_BASE_URL ?? '';
  const iftttTrigger = flow(
    firstMessage,
    triggerName,
    createIftttTrigger,
  )(event.Records);
  await iftttTrigger(gotLib, iftttKey, iftttBaseUrl);
};
