import { RepositoriesStatus } from './repositories';
import { Got } from 'got';

export type IftttTriggerName =
  | 'ci_build_success'
  | 'ci_build_pending'
  | 'ci_build_failure';

export function triggerName(
  overallStatus: RepositoriesStatus,
): IftttTriggerName {
  switch (overallStatus) {
    case 'success':
      return 'ci_build_success';
    case 'pending':
      return 'ci_build_pending';
    case 'failed':
    default:
      return 'ci_build_failure';
  }
}

export function createIftttTrigger(
  got: Got,
  iftttKey: string,
  iftttBaseUrl: string,
) {
  return (trigger: string) => {
    return got(`trigger/${trigger}/with/key/${iftttKey}`, {
      prefixUrl: iftttBaseUrl,
      resolveBodyOnly: true,
    });
  };
}
