import { getConfig, Config } from '@/config';

describe('config', () => {
  it('should return a config object', () => {
    const actual = getConfig({
      VUE_APP_FIREBASE_API_KEY: 'the-api-key',
      VUE_APP_FIREBASE_MESSAGING_SENDER_ID: 'the-messaging-sender-id',
      VUE_APP_FIREBASE_PUBLIC_VAPID_KEY: 'the-public-vapid-key',
    });
    expect(actual).toEqual({
      socketUrl: 'https://cibulb-service.now.sh',
      firebase: {
        apiKey: 'the-api-key',
        messagingSenderId: 'the-messaging-sender-id',
        publicVapidKey: 'the-public-vapid-key',
      },
    } as Config);
  });
});
