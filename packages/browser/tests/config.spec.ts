import { getConfig, Config } from '@/config';

describe('config', () => {
  it('should return a config object', () => {
    const actual = getConfig({
      VUE_APP_FIREBASE_API_KEY: 'the-api-key',
    });
    expect(actual).toEqual({
      socketUrl: 'https://cibulb-service.now.sh',
      firebase: {
        apiKey: 'the-api-key',
      },
    } as Config);
  });
});
