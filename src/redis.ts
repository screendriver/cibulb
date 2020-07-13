import Redis from 'ioredis';
import { Logger } from 'pino';

export type RepositoryStatus =
  | 'success'
  | 'running'
  | 'skipped'
  | 'pending'
  | 'failed';

export function createRedis(logger: Logger): Promise<Redis.Redis> {
  const redis = new Redis({ host: 'redis' });
  return new Promise((resolve, reject) => {
    redis.on('connect', () => resolve(redis));
    redis.on('error', (error) => {
      logger.error(error);
      reject(error);
    });
  });
}

export function getAllKeys(redis: Redis.Redis): Promise<readonly string[]> {
  return redis.keys('*');
}

export function getAllValues(
  redis: Redis.Redis,
  keys: readonly string[],
): Promise<string | null>[] {
  return keys.map((key) => redis.get(key));
}
